const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const getRootPath = require('../utils/getRootPath');

// Create New Category
exports.createCategory = async (req, res) => {
    if (req.user.isAdmin) {
        const { title, description } = req.body
        try {
            const catExist = await Category.findOne({ title: title })
            if (!catExist) {
                const catObj = {
                    title,
                    description: description ? description : ''
                }

                if (req.file) {
                    // Upload to Local Folder
                    // catObj.thumbnail = `/uploads/media/${req.file.filename}`;

                    // Upload to Cloudinary
                    let filePath = await cloudinary.uploader.upload(req.file.path, { folder: "haatEcommerce" });

                    catObj.thumbnail = filePath.secure_url;
                }

                const newCategory = new Category(catObj);

                await newCategory.save();
                res.status(201).json(newCategory)
            } else {
                res.status(403).json({
                    message: `Category(${category}) already exist!`
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Update Category
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body
    if (req.user.isAdmin) {
        try {
            const category = await Category.findById(id)
            if (!category) {
                return res.status(403).json({
                    message: 'Category not exist'
                });
            }

            const catObj = {
                title,
                description: description ? description : ''
            }

            if (req.file) {
                // Upload to Local Folder
                // const rootPath = await getRootPath();
                // const filePath = rootPath + '/public' + category.thumbnail
                // catObj.thumbnail = `/uploads/media/${req.file.filename}`;

                // if (category.thumbnail) {
                //     fs.unlink(filePath, (err) => {
                //         if (err) {
                //             console.log(err)
                //         }
                //     });
                // }

                // Upload to Cloudinary
                let filePath = await cloudinary.uploader.upload(req.file.path, { folder: "haatEcommerce" });
                catObj.thumbnail = filePath.secure_url;

            }

            const updatedCategory = await Category.findByIdAndUpdate(id, {
                $set: catObj
            }, { new: true });


            // TODO: Implement better solution for updating ----
            const products = await Product.find({ categories: category.title });

            if (products.length > 0) {
                products.forEach(async (product) => {
                    const oldProductCats = product.categories.filter(cat => cat !== category.title);
                    const newProductCats = [...oldProductCats, updatedCategory.title]
                    await Product.findOneAndUpdate(
                        { _id: product._id },
                        { categories: newProductCats },
                        { new: true }
                    )
                });
            }

            res.status(200).json(updatedCategory);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}


// Get Single Category
exports.getSingleCategory = async (req, res) => {
    const { id } = req.params
    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found!'
            })
        }
        res.status(200).json(category)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}



// Get All Category
exports.getAllCategory = async (req, res) => {
    try {
        const currentPage = Number.parseInt(req.query.page, 10) || 1;
        const itemPerPage = Number.parseInt(req.query.limit, 10) || 16;

        const totalCategories = await Category.countDocuments()
        const totalPage = Math.ceil(totalCategories / itemPerPage);

        let categories;
        if (currentPage) {
            categories = await Category.find()
                .sort({ title: 1 })
                .skip((itemPerPage * currentPage) - itemPerPage)
                .limit(itemPerPage)
        } else {
            categories = await Category.find().sort({ title: 1 })
        }

        if (currentPage > totalPage) {
            return res.status(404).json({
                message: 'No Page Found.'
            })
        }
        res.status(200).json({
            categories: categories,
            totalPage: totalPage,
            currentPage: currentPage,
            totalCategories: totalCategories
        })

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}



// Delete a Category
exports.deleteCategory = async (req, res) => {
    if (req.user.isAdmin) {
        const id = req.params.id;
        try {
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({
                    message: 'Category not found!'
                })
            }

            const products = await Product.find({ categories: category.title });
            products.forEach(async (product) => {
                if (product.categories.includes(category.title)) {
                    await Product.findOneAndUpdate({ _id: product._id }, { $pull: { categories: category.title } }, { new: true });
                }
            });

            await Category.findByIdAndDelete(id);

            // For Local Folder's File
            // if (category.thumbnail) {
            //     const rootPath = await getRootPath();
            //     const filePath = rootPath + '/public' + category.thumbnail

            //     fs.unlink(filePath, (err) => {
            //         if (err) {
            //             console.log(err)
            //         }
            //     });
            // }

            res.status(200).json(category);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}



// Delete Many Categories
exports.deleteManyCategories = async (req, res) => {
    const categoryIds = req.body.categoryIds
    if (req.user.isAdmin) {
        try {


            const categories = await Category.find({ _id: { $in: categoryIds } })

            categories.forEach(async (category) => {

                /*
                   **** Remove Category Thumbnail ***
               */
                if (category.thumbnail) {
                    const rootPath = await getRootPath();
                    const filePath = rootPath + '/public' + category.thumbnail

                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });
                }

                category.products.forEach(async (product) => {
                    await Product.findOneAndUpdate(
                        { _id: product },
                        { $pull: { categories: category.title } }, { new: true }
                    )
                })
            });

            await Category.deleteMany({ _id: { $in: categoryIds } });

            const restCategories = await Category.find();

            res.status(200).json(restCategories);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    } else {
        res.status(401).json({ message: "You are not allowed to perform this action" });
    }
}
