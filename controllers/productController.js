const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const getRootPath = require('../utils/getRootPath');

// Add New Product 
exports.createProduct = async (req, res) => {
    if (req.user.isAdmin) {
        const { title, description, categories, sizes, colors, regularPrice, salePrice, inStock, stock } = req.body;

        const productInfo = {
            title,
            description,
            regularPrice,
            stock,
            inStock
        }

        if (salePrice) productInfo.salePrice = salePrice;
        if (categories) productInfo.categories = categories;
        if (sizes) productInfo.sizes = sizes.split(',');
        if (colors) productInfo.colors = colors.split(',');
        if (colors || sizes) productInfo.variation = true;



        // TODO: Implement File system for Thumbnails and gallery

        if (req.files && req.files.thumbnail) {
            productInfo.thumbnail = `/uploads/media/${req.files.thumbnail[0].filename}`;
        }

        const galleryImages = [];
        if (req.files && req.files.gallery) {
            req.files.gallery.forEach(file => {
                const galleryImage = `/uploads/media/${file.filename}`;
                galleryImages.push(galleryImage);
            });

            productInfo.gallery = galleryImages;
        }



        try {
            const newProduct = new Product(productInfo);
            await newProduct.save();

            if (categories) {
                categories.split(',').forEach(async (category) => {
                    await Category.findOneAndUpdate({ title: category }, { $push: { products: newProduct._id } }, { new: true })
                });
            }

            res.status(201).json(newProduct);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Update A Product 
exports.updateProduct = async (req, res) => {

    if (req.user.isAdmin) {
        const id = req.params.id;

        const { title, description, categories, sizes, colors, regularPrice, salePrice, inStock, stock } = req.body;

        try {

            const oldProduct = await Product.findById(id);

            if (!oldProduct) {
                return res.status(404).json({
                    message: 'Product not found!'
                })
            } else {

                const productInfo = {
                    title: title,
                    description: description,
                    regularPrice: regularPrice,
                    inStock: inStock,
                    stock: stock,
                }

                if (salePrice) productInfo.salePrice = salePrice;
                if (categories) productInfo.categories = categories;
                if (sizes) productInfo.sizes = sizes.split(',');
                if (colors) productInfo.colors = colors.split(',');
                if (colors || sizes) {
                    productInfo.variation = true
                } else {
                    productInfo.variation = false
                }



                // TODO: Implement File system for Thumbnails and gallery
                const rootPath = await getRootPath();

                if (req.files && req.files.thumbnail) {
                    productInfo.thumbnail = `/uploads/media/${req.files.thumbnail[0].filename}`;




                    if (oldProduct.thumbnail) {
                        const filePath = rootPath + '/public' + oldProduct.thumbnail
                        // Remove old thumbnail
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log(err.message)
                            }
                        })

                    }
                }

                const galleryImages = [];
                if (req.files && req.files.gallery) {
                    req.files.gallery.forEach(file => {
                        const galleryImage = `/uploads/media/${file.filename}`;
                        galleryImages.push(galleryImage);
                    });
                    productInfo.gallery = galleryImages;

                    if (oldProduct.gallery.length > 0) {

                        // Remove Old images
                        oldProduct.gallery.forEach(item => {
                            const filePath = rootPath + '/public' + item
                            fs.unlink(filePath, (err) => {
                                if (err) {
                                    console.log(err)
                                }
                            })
                        });
                    }

                }

                if (categories) {
                    const catsArray = categories.split(',');
                    if (oldProduct.categories && oldProduct.categories.length > 0) {
                        oldProduct.categories.forEach(async (category) => {
                            if (!catsArray.includes(category)) {
                                await Category.findOneAndUpdate({ title: category }, { $pull: { products: id } }, { new: true })
                            }
                        })
                    }

                    catsArray.forEach(async (title) => {
                        const category = await Category.findOne({ title: title })
                        if (!category.products.includes(id)) {
                            await Category.findOneAndUpdate({ title: title }, { $push: { products: id } }, { new: true })
                        }
                    });
                }

                const newProduct = await Product.findByIdAndUpdate(id, {
                    $set: productInfo
                }, { new: true })
                res.status(201).json(newProduct);

            }


        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Delete a Product
exports.deleteProduct = async (req, res) => {
    if (req.user.isAdmin) {
        const id = req.params.id;
        try {
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found!'
                })
            }

            const categories = await Category.find({ products: id });
            categories.forEach(async (category) => {
                if (category.products.includes(id)) {
                    await Category.findOneAndUpdate({ title: category.title }, { $pull: { products: id } }, { new: true });
                }
            });

            await Product.findByIdAndDelete(id);

            const rootPath = await getRootPath();

            if (product.thumbnail) {
                const filePath = rootPath + '/public' + product.thumbnail
                // Remove Product images
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
            }
            if (product.gallery.length > 0) {
                // Remove Product images
                product.gallery.forEach(item => {
                    const filePath = rootPath + '/public' + item
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })

                });
            }

            res.status(200).json(product);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Get All Products
exports.getAllProducts = async (req, res) => {

    try {
        const currentPage = Number.parseInt(req.query.page, 10) || 1;
        const itemPerPage = Number.parseInt(req.query.limit, 10) || 12;

        const totalProducts = await Product.countDocuments()
        const totalPage = Math.ceil(totalProducts / itemPerPage);

        let products;
        if (currentPage) {
            products = await Product.find()
                .sort({ title: 1 })
                .skip((itemPerPage * currentPage) - itemPerPage)
                .limit(itemPerPage)
        } else {
            products = await Product.find().sort({ title: 1 })
        }

        if (currentPage > totalPage) {
            return res.status(404).json({
                message: 'No Page Found.'
            })
        }

        res.status(200).json({
            products: products,
            totalPage: totalPage,
            currentPage: currentPage,
            totalProducts: totalProducts
        })

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}



// Get Single Product
exports.getSingleProduct = async (req, res) => {
    const id = req.params.id;
    try {

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found!'
            })
        }

        res.status(200).json(product);

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}


// Get Products by Category
exports.getProductByCategory = async (req, res) => {

    const { title } = req.params;
    const currentPage = Number.parseInt(req.query.page, 10) || 1;
    const itemPerPage = Number.parseInt(req.query.limit, 10) || 12;

    try {
        const category = await Category.findOne({ title: title })
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        const totalProducts = await Product.countDocuments({ categories: title })
        const totalPage = Math.ceil(totalProducts / itemPerPage);


        let products;
        if (currentPage) {
            products = await Product.find({ categories: title })
                .sort({ title: 1 })
                .skip((itemPerPage * currentPage) - itemPerPage)
                .limit(itemPerPage)
        } else {
            products = await Product.find({ categories: title }).sort({ title: 1 })
        }

        if (currentPage > totalPage) {
            return res.status(404).json({
                message: 'No Page Found.'
            })
        }

        res.status(200).json({
            products: products,
            totalPage: totalPage,
            currentPage: currentPage,
            totalProducts: totalProducts
        })

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}



// Delete Many Products 
exports.deleteManyProducts = async (req, res) => {
    const productIds = req.body.productIds
    if (req.user.isAdmin) {
        try {


            const products = await Product.find({ _id: { $in: productIds } })
            products.forEach(async (product) => {


                /*
                    **** Remove Product Thumbnail and Images ***
                */
                const rootPath = await getRootPath();
                if (product.thumbnail) {
                    const filePath = rootPath + '/public' + product.thumbnail
                    // Remove Product images
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                }
                if (product.gallery.length > 0) {
                    // Remove Product images
                    product.gallery.forEach(item => {
                        const filePath = rootPath + '/public' + item
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log(err)
                            }
                        })

                    });
                }

                // Delete the product from category 
                product.categories.forEach(async (category) => {
                    await Category.findOneAndUpdate(
                        { title: category },
                        { $pull: { products: product._id } }, { new: true }
                    )
                });

            });

            await Product.deleteMany({ _id: { $in: productIds } });

            const restProducts = await Product.find();

            res.status(200).json(restProducts);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Add Product Review
exports.addProductReview = async (req, res) => {
    const { name, email, review, rating } = req.body;
    const { id } = req.params;
    try {
        if (name && email) {
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found!'
                })
            }

            const updateProduct = await Product.findByIdAndUpdate(
                id,
                {
                    $push: { reviews: { name, email, review, rating, time: Date.now() } }
                },
                { new: true }
            );

            res.status(201).json(updateProduct);

        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}



// Get Cart Products
exports.getCartProducts = async (req, res) => {
    const ids = req.body.cartIds
    try {
        const products = await Product.find({
            _id: { $in: ids }
        });

        res.status(200).json(products)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}