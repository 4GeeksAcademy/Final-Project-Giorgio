export const initialStore = () => {
    return {
        token: localStorage.getItem("token") || null,
        user: JSON.parse(localStorage.getItem("user")) || null,
        cart: [],
        products: [],
        categories: [],
        currentProduct: null,
    }
}

export default function storeReducer(store, action) {
    switch (action.type) {

        case "SET_TOKEN":
            localStorage.setItem("token", action.payload.token)
            localStorage.setItem("user", JSON.stringify(action.payload.user))
            return { ...store, token: action.payload.token, user: action.payload.user }

        case "LOGOUT":
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            return { ...store, token: null, user: null, cart: [] }

        case "SET_PRODUCTS":
            return { ...store, products: action.payload }

        case "SET_CATEGORIES":
            return { ...store, categories: action.payload }

        case "SET_CURRENT_PRODUCT":
            return { ...store, currentProduct: action.payload }

        case "SET_CART":
            return { ...store, cart: action.payload }

        default:
            return store
    }
}