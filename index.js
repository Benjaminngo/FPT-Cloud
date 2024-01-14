const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;

const dbUrl = "mongodb+srv://owner:tjuZJwlqmYSAzPEI@atn.qyuce32.mongodb.net/?retryWrites=true&w=majority";

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(dbUrl, connectionParams)
  .then(() => {
    console.info("Connected to DB");
  })
  .catch((e) => {
    console.log("Error:", e);
  });

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  image: String, // New field for storing image filename
});

const Product = mongoose.model("Product", productSchema);

const upload = multer({ dest: "uploads/" });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.use("/uploads", express.static("uploads")); // Serve uploaded images

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dashboard.html");
});

app.post("/add-product", upload.single("product-image"), async (req, res) => {
  const { name, category, price } = req.body;
  const image = req.file ? req.file.filename : null; // Save the filename if an image is uploaded
  console.log("Uploaded file:", req.file);
  console.log("Form data:", req.body);

  const newProduct = new Product({
    name,
    category,
    price,
    image,
  });

  try {
    await newProduct.save();
    res.status(200).json({ message: "done" });
  } catch (error) {
    console.error("Error when saving product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/get-products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/update-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, category, price } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, category, price },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});
