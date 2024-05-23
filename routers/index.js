const router = require('express').Router()
const Controller = require('../controllers/controller')
// const { isAuthenticated, isAdmin } = require('../middlewares/auth');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next()
    }
    res.redirect('/login')
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next()
    }
    res.redirect('/')
}

// Public routes
router.get('/', Controller.renderLandingPage)

// Authentication routes
router.get('/login', Controller.renderLoginPage)
router.post('/login', Controller.handleLogin)
router.get('/signup', Controller.renderSignUpPage)
router.post('/signup', Controller.handleSignUp)
router.get('/logout', Controller.handleLogout)

// Admin routes
router.get('/admin', isAdmin, Controller.renderAdminHomePage)
router.post('/admin/add-product', isAdmin, Controller.handleAddProduct)
router.post('/admin/delete-product/:id', isAdmin, Controller.handleDeleteProduct)
router.get('/admin/edit-product/:id', isAdmin, Controller.renderEditProductPage)
router.post('/admin/edit-product/:id', isAdmin, Controller.handleEditProduct)

// User routes
router.get('/homepage', isAuthenticated, Controller.renderUserHomePage)
router.get('/profile', isAuthenticated, Controller.renderUserProfile)
router.post('/profile', Controller.handleSaveProfile)
router.get('/wishlist', isAuthenticated, Controller.renderAddToWishlist)
router.post('/wishlist',  isAuthenticated, Controller.handleAddToWishlist)
router.post('/wishlist/delete/:itemId', Controller.deleteWishlistItem)

module.exports = router