import click
from api.models import db, User, Category, Product
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def setup_commands(app):

    @app.cli.command("insert-test-data")
    def insert_test_data():
        print("Inserting test data...")

        # Categories
        categories = [
            Category(name="Smartphones", slug="smartphones"),
            Category(name="Laptops", slug="laptops"),
            Category(name="Audio", slug="audio"),
            Category(name="Gaming", slug="gaming"),
            Category(name="Accessories", slug="accessories"),
        ]
        for c in categories:
            existing = Category.query.filter_by(slug=c.slug).first()
            if not existing:
                db.session.add(c)
        db.session.commit()
        print("Categories created.")

        smartphones = Category.query.filter_by(slug="smartphones").first()
        laptops = Category.query.filter_by(slug="laptops").first()
        audio = Category.query.filter_by(slug="audio").first()
        gaming = Category.query.filter_by(slug="gaming").first()
        accessories = Category.query.filter_by(slug="accessories").first()

        # Products
        products = [
            Product(name="iPhone 15 Pro", description="Apple's latest flagship with titanium design and A17 Pro chip.", price=1199.99, stock=20, image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600", is_featured=True, category_id=smartphones.id),
            Product(name="Samsung Galaxy S24 Ultra", description="200MP camera, S Pen included, AI-powered features.", price=1299.99, stock=15, image_url="https://images.unsplash.com/photo-1706230580977-e5d962a7c37f?w=600", is_featured=True, category_id=smartphones.id),
            Product(name="Google Pixel 8", description="Pure Android experience with best-in-class computational photography.", price=699.99, stock=18, image_url="https://images.unsplash.com/photo-1696446701796-da61dab7c2e6?w=600", is_featured=False, category_id=smartphones.id),
            Product(name="MacBook Pro 14\"", description="M3 Pro chip, Liquid Retina XDR display, up to 18h battery.", price=1999.99, stock=10, image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", is_featured=True, category_id=laptops.id),
            Product(name="Dell XPS 15", description="OLED display, Intel Core i9, RTX 4060, premium build quality.", price=1799.99, stock=8, image_url="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600", is_featured=True, category_id=laptops.id),
            Product(name="ASUS ROG Zephyrus G14", description="AMD Ryzen 9, RTX 4070, compact gaming powerhouse.", price=1599.99, stock=12, image_url="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600", is_featured=False, category_id=laptops.id),
            Product(name="Sony WH-1000XM5", description="Industry-leading noise cancellation, 30h battery, Hi-Res Audio.", price=349.99, stock=25, image_url="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600", is_featured=True, category_id=audio.id),
            Product(name="AirPods Pro 2nd Gen", description="Active noise cancellation, Adaptive Transparency, MagSafe charging.", price=249.99, stock=30, image_url="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600", is_featured=False, category_id=audio.id),
            Product(name="PlayStation 5", description="Next-gen gaming console with DualSense controller and 4K gaming.", price=499.99, stock=5, image_url="https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600", is_featured=True, category_id=gaming.id),
            Product(name="Xbox Series X", description="Most powerful Xbox ever. 12 teraflops, 4K gaming, Game Pass ready.", price=499.99, stock=7, image_url="https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600", is_featured=False, category_id=gaming.id),
            Product(name="Logitech MX Master 3S", description="Advanced wireless mouse, 8K DPI, silent clicks, ergonomic design.", price=99.99, stock=40, image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600", is_featured=False, category_id=accessories.id),
            Product(name="Anker 65W GaN Charger", description="Compact 3-port charger, USB-C PD, charges laptop + phone + tablet.", price=49.99, stock=50, image_url="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600", is_featured=False, category_id=accessories.id),
        ]
        for p in products:
            existing = Product.query.filter_by(name=p.name).first()
            if not existing:
                db.session.add(p)
        db.session.commit()
        print(f"{len(products)} products created.")

        # Admin user
        admin = User.query.filter_by(email="admin@techdrop.com").first()
        if not admin:
            hashed = bcrypt.generate_password_hash("admin123").decode('utf-8')
            admin = User(
                email="admin@techdrop.com",
                password=hashed,
                name="Admin",
                is_active=True,
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: admin@techdrop.com / admin123")
        else:
            print("Admin user already exists.")

        print("Done!")