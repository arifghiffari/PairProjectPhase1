const { Category, Product, Profile, User, Wishlist } = require('../models')
const bcrypt = require('bcrypt')
const convertPrice = require('../helpers/convertPrice')
const axios = require('axios')

class Controller {
    static async renderLandingPage(req, res) {
        try {
            res.render('landingPage')
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async renderLoginPage(req, res) {
        let { errors } = req.query

        if (errors) {
            errors = errors.split(',')
        }

        res.render('login', { errors })
    }

    static async handleLogin(req, res) {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ where: { email } })

            if ((email == null || email == '') && (password == null || password == '')) {
                res.redirect('/login?errors=Email and password cannot be empty.')
                return
            } else if (email == null || email == ''){
                res.redirect('/login?errors=Email cannot be empty.')
                return
            } else if (password == null || password == ''){
                res.redirect('/login?errors=Password cannot be empty.')
                return
            }

            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.user = { id: user.id, email: user.email, isAdmin: user.isAdmin }

                if (user.isAdmin) {
                    return res.redirect('/admin')
                } else {
                    return res.redirect('/homepage')
                }
            } else {
                res.redirect('/login?errors=Email or password is invalid.')
            }
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeValidationError') {
                let message = error.errors.map(el => el.message)
                res.redirect(`/login?errors=${message}`)
            } else {
                res.send(error)
            }
        }
    }

    static renderSignUpPage(req, res) {
        res.render('signup')
    }

    static async handleSignUp(req, res) {
        try {
            let email = req.body.email
            let password = req.body.password
            let captchaResponse = req.body['h-captcha-response']
            const hashedPassword = bcrypt.hashSync(password, 10)
            let payload = new URLSearchParams();
            payload.append('response', captchaResponse);
            payload.append('secret', 'ES_5a8698d569d24805964fbf4581e75171');
            
            let response = await axios.post('https://api.hcaptcha.com/siteverify', payload.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            
            if (response.data.success) {
                await User.create({ email, password: hashedPassword, isAdmin: true })

                res.redirect('/login')
            }

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static handleLogout(req, res) {
        req.session.destroy(err => {
            if (err) {
                console.log(err)
                return res.send(err)
            }
            res.redirect('/login')
        })
    }

    static async renderAdminHomePage(req, res) {
        try {
            let { errors } = req.query

            if (errors) {
                errors = errors.split(',')
            }

            const { search } = req.query
            const products = await Product.getProductsByName(search)
            const categories = await Category.findAll()

            res.render('adminPage', { products, categories, errors, convertPrice, actionUrl: '/admin' })

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async renderUserHomePage(req, res) {
        try {
            const { search } = req.query
            const products = await Product.getProductsByName(search)
            const users = await User.findAll()
            const userWishlist = await Wishlist.findAll({ where: { UserId: req.session.user.id } })

            res.render('userPage', { products, users, userWishlist, convertPrice, actionUrl: '/homepage' })

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async handleAddProduct(req, res) {
        try {
            const { name, imageUrl, price, description, stock, CategoryId } = req.body
            await Product.create({ name, imageUrl, price, description, stock, CategoryId })

            res.redirect('/admin')

        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                let message = error.errors.map(el => el.message)
                res.redirect(`/admin/add-product?errors=${message}`)
            } else {
                res.send(error)
            }
        }
    }

    static async renderEditProductPage(req, res) {
        try {
            let { errors } = req.query

            if (errors) {
                errors = errors.split(',')
            }

            const { id } = req.params
            const product = await Product.findByPk(id, {
                include: Category
            })
            const categories = await Category.findAll()

            res.render('editProduct', { product, errors, categories })

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async handleEditProduct(req, res) {
        try {
            const { id } = req.params
            const { name, imageUrl, price, description, stock, CategoryId } = req.body

            await Product.update(
                { name, imageUrl, price, description, stock, CategoryId },
                { where: { id } }
            )

            res.redirect('/admin')

        } catch (error) {
            const { id } = req.params
            if (error.name === 'SequelizeValidationError') {
                let message = error.errors.map(el => el.message)
                res.redirect(`/admin/edit-product/${id}?errors=${message}`)
            } else {
                res.send(error)
            }
        }
    }

    static async handleDeleteProduct(req, res) {
        try {
            const { id } = req.params
            await Product.destroy({ where: { id } })
            res.redirect('/admin')

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async renderAddToWishlist(req, res) {
        try {
            const { search } = req.query
            const products = await Product.getProductsByName(search)
            const userId = req.session.user.id
            const wishlistItems = await Wishlist.findAll({
                where: { UserId: userId },
                include: [

                    { model: User },
                    {
                        model: Product,
                        include: [Category]
                    }
                ]
            })
            
            const wishlistSummary = await Wishlist.summarize(userId)
    
            res.render('wishlist', { products, wishlistItems, wishlistSummary, convertPrice, actionUrl: '/wishlist' })

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async handleAddToWishlist(req, res) {
        try {
            const { productId } = req.body
            await Wishlist.create({
                UserId: req.session.user.id,
                ProductId: productId
            })

            res.redirect('/wishlist')

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async deleteWishlistItem(req, res) {
        try {
            const { itemId } = req.params
            await Wishlist.destroy({ where: { id: itemId } })

            res.redirect('/wishlist')

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async renderUserProfile(req, res) {
        try {
            const userId = req.session.user.id
            console.log(userId)
            const user = await User.findByPk(userId)
            let userProfile = await Profile.findOne({ where: { UserId: userId } })

            if (!userProfile) {
                userProfile = {}
            }

            res.render('userProfile', { user, userProfile })

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }


    static async handleSaveProfile(req, res) {
        try {
            const { firstName, lastName, gender } = req.body;
            const userId = req.session.user.id;

            const userProfile = await Profile.findOne({ where: { UserId: userId } });

            if (userProfile) {
                await userProfile.update({ firstName, lastName, gender });
            } else {
                await Profile.create({ firstName, lastName, gender, UserId: userId });
            }

            const user = await User.findByPk(userId);

            res.redirect('/profile')

        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }
}

module.exports = Controller
