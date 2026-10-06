import productModel from "../models/product.model.js";
import { generateProductDetails } from "../services/product-ai.service.js";


export const uploadProduct =async (req,res)=>{

    const {title,description,shortDescription,price,stock} =req.body;
    const frontImageIndex = Number(req.body.frontImageIndex);
    const seller = req.user;


    if(!title || !description || !shortDescription || !price ){
        return res.status(400).json({
            status:false,
            message:"Enter proper detail in upload product"
        })
    }

    const images = req.files
    ? await Promise.all(
        req.files.map(async (file, index) => {
            const uploadRes = await uploadImage(
                file,
                `ecommerce/${seller._id}/products`
            );

            return {
                publicId: uploadRes.publicId,
                privateId: uploadRes.privateId,
                isFront: index === frontImageIndex
            };
        })
    )
    : [];

    const product = await productModel.create({
            title,
            description,
            shortDescription,
            price,
            sellerID: seller._id,
            images,
        });

        return res.status(201).json({
            message: "product has been created",
            success: true,
            product
        });
    
}

export const getAllProduct = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            productModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            productModel.countDocuments()
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            message: "All products fetched",
            success: true,

            pagination: {
                page,
                limit,
                totalProducts,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },

            products
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

export const getSellerProduct = async (req, res) => {
    try {
        const sellerId = req.user._id;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            productModel
                .find({
                    sellerID: sellerId
                })
                .skip(skip)
                .limit(limit),

            productModel.countDocuments({
                sellerID: sellerId
            })
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            message: "Seller products fetched successfully",
            success: true,

            pagination: {
                currentPage: page,
                limit,
                totalProducts,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },

            products
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

export const getProductDetails =async (req,res)=>{

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
                success: false
            });
    }

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

        return res.status(200).json({
            message: "Product details fetched successfully",
            success: true,
            product
        })
}

export const deleteProduct =async (req,res)=>{

    try{
        const productId = req.params.id;
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await productModel.findByIdAndDelete(productId);

        return res.status(200).json({
            message:"product has deleted"
        })

    }catch(error){
        console.log("error in delete product : ",error)
    }
}

export const searchProduct = async (req, res) => {
    try {
        const search = req.query.search?.trim();

        if (!search) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const products = await productModel
            .find({
                title: {
                    $regex: `^${search}`,
                    $options: "i"
                }
            })
            .select("title image price")
            .sort({ title: 1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            search,
            count: products.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const generateProductAI = async (req, res) => {

    try {

        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Find product
        const product = await productModel.findOne({
            _id: productId,
            sellerID: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Find seller selected front image
        const frontImage = product.image.find(
            image => image.isFront === true
        );

        if (!frontImage) {
            return res.status(400).json({
                success: false,
                message: "Please select a front image first"
            });
        }

        // Download image from your storage
        const imageResponse = await fetch(frontImage.url);

        if (!imageResponse.ok) {
            return res.status(400).json({
                success: false,
                message: "Unable to access product image"
            });
        }

        const arrayBuffer = await imageResponse.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        // Create file object for Gemini service
        const file = {
            buffer,
            mimetype: imageResponse.headers.get("content-type") || "image/jpeg"
        };

        // Generate product details
        const aiData = await generateProductDetails(file);

        return res.status(200).json({
            success: true,
            message: "Product details generated successfully",
            data: aiData
        });

    } catch (error) {

        console.error("Product AI Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate product details",
            error: error.message
        });
    }
};