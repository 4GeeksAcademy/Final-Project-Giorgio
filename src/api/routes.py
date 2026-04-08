"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, User, Product, Category, CartItem, Order, OrderItem
from api.utils import APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
import os

api = Blueprint('api', __name__)
CORS(api)
bcrypt = Bcrypt()

# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────

@api.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"error": "Email, password and name are required"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400

    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(email=data['email'], password=hashed, name=data['name'])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 201


@api.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or not bcrypt.check_password_hash(user.password, data.get('password', '')):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 200


@api.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.serialize()), 200


# ─────────────────────────────────────────
# CATEGORIES
# ─────────────────────────────────────────

@api.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([c.serialize() for c in categories]), 200


@api.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    user = User.query.get(int(get_jwt_identity()))
    if not user.is_admin:
        return jsonify({"error": "Admin only"}), 403

    data = request.get_json()
    if not data.get('name') or not data.get('slug'):
        return jsonify({"error": "Name and slug are required"}), 400

    category = Category(name=data['name'], slug=data['slug'])
    db.session.add(category)
    db.session.commit()
    return jsonify(category.serialize()), 201


# ─────────────────────────────────────────
# PRODUCTS
# ─────────────────────────────────────────

@api.route('/products', methods=['GET'])
def get_products():
    category_slug = request.args.get('category')
    featured = request.args.get('featured')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort = request.args.get('sort')

    query = Product.query

    if category_slug:
        category = Category.query.filter_by(slug=category_slug).first()
        if category:
            query = query.filter_by(category_id=category.id)

    if featured == 'true':
        query = query.filter_by(is_featured=True)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Product.price.desc())

    products = query.all()
    return jsonify([p.serialize() for p in products]), 200


@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.serialize()), 200


@api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    user = User.query.get(int(get_jwt_identity()))
    if not user.is_admin:
        return jsonify({"error": "Admin only"}), 403

    data = request.get_json()
    product = Product(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        stock=data.get('stock', 0),
        image_url=data.get('image_url'),
        is_featured=data.get('is_featured', False),
        category_id=data.get('category_id')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.serialize()), 201


@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user = User.query.get(int(get_jwt_identity()))
    if not user.is_admin:
        return jsonify({"error": "Admin only"}), 403

    product = Product.query.get_or_404(product_id)
    data = request.get_json()

    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.image_url = data.get('image_url', product.image_url)
    product.is_featured = data.get('is_featured', product.is_featured)
    product.category_id = data.get('category_id', product.category_id)

    db.session.commit()
    return jsonify(product.serialize()), 200


@api.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user = User.query.get(int(get_jwt_identity()))
    if not user.is_admin:
        return jsonify({"error": "Admin only"}), 403

    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200


# ─────────────────────────────────────────
# CART
# ─────────────────────────────────────────

@api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = int(get_jwt_identity())
    items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.serialize() for item in items]), 200


@api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    existing = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        existing.quantity += quantity
    else:
        item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(item)

    db.session.commit()
    items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.serialize() for item in items]), 200


@api.route('/cart/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    user_id = int(get_jwt_identity())
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first_or_404()
    data = request.get_json()
    item.quantity = data.get('quantity', item.quantity)
    db.session.commit()
    items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.serialize() for item in items]), 200


@api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_cart_item(item_id):
    user_id = int(get_jwt_identity())
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.serialize() for item in items]), 200


@api.route('/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user_id = int(get_jwt_identity())
    CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify([]), 200


# ─────────────────────────────────────────
# ORDERS
# ─────────────────────────────────────────

@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    user_id = int(get_jwt_identity())
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"error": "Cart is empty"}), 400

    total = sum(item.product.price * item.quantity for item in cart_items)

    order = Order(user_id=user_id, total=total, status="completed")
    db.session.add(order)
    db.session.flush()

    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.product.price
        )
        db.session.add(order_item)
        product = Product.query.get(item.product_id)
        product.stock = max(0, product.stock - item.quantity)

    CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    return jsonify(order.serialize()), 201


@api.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return jsonify([o.serialize() for o in orders]), 200


# ─────────────────────────────────────────
# ADMIN — Users list
# ─────────────────────────────────────────

@api.route('/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    user = User.query.get(int(get_jwt_identity()))
    if not user.is_admin:
        return jsonify({"error": "Admin only"}), 403

    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200