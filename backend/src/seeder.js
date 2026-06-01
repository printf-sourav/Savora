import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Product } from "./models/product.model.js";
import { Category } from "./models/category.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/savora`);
    console.log("MongoDB Connected for Seeding");
  } catch (error) {
    console.error("MongoDB connection FAILED: ", error);
    process.exit(1);
  }
};

const dummyCategories = [
  {
    name: "Breakfast & Breads",
    slug: "breakfast-breads",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80",
    description: "Fresh breakfast staples and soft breads",
  },
  {
    name: "Snacks & Namkeen",
    slug: "snacks-namkeen",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&q=80",
    description: "Crunchy bites for tea time",
  },
  {
    name: "Main Course",
    slug: "main-course",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    description: "Wholesome meals for lunch and dinner",
  },
  {
    name: "Sweets & Desserts",
    slug: "sweets-desserts",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=1200&q=80",
    description: "Traditional sweets and indulgent desserts",
  },
];

const makeImages = (items) =>
  items.map((url, index) => ({
    url,
    public_id: `${url.split("/").pop()?.split("?")[0] || "image"}_${index + 1}`,
  }));

const dummyProducts = (categories) => [
  {
    title: "Butter Garlic Naan",
    slug: "butter-garlic-naan",
    description: "Soft tandoor naan brushed with butter and finished with garlic and coriander.",
    shortDescription: "Soft garlic naan bread",
    category: categories[0]._id,
    price: 129,
    discountPrice: 99,
    stock: 120,
    images: makeImages([
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&q=80",
      "https://images.unsplash.com/photo-1604908177522-4035fae7fe4d?w=1200&q=80",
    ]),
    featured: true,
    bestseller: true,
    ratings: 4.7,
  },
  {
    title: "Masala Pav",
    slug: "masala-pav",
    description: "Mumbai-style pav tossed in spicy masala butter and fresh herbs.",
    shortDescription: "Street-style spiced pav",
    category: categories[0]._id,
    price: 149,
    discountPrice: 119,
    stock: 100,
    images: makeImages([
      "https://images.unsplash.com/photo-1626082927389-6cd0970d5bfe?w=1200&q=80",
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    ]),
    featured: false,
    bestseller: true,
    ratings: 4.5,
  },
  {
    title: "Poha Breakfast Mix",
    slug: "poha-breakfast-mix",
    description: "Light and fluffy poha seasoned with peanuts, mustard seeds, and curry leaves.",
    shortDescription: "Ready-to-cook poha mix",
    category: categories[0]._id,
    price: 189,
    discountPrice: 149,
    stock: 140,
    images: makeImages([
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80",
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=80",
    ]),
    featured: false,
    bestseller: false,
    ratings: 4.4,
  },
  {
    title: "Plain Paratha Pack",
    slug: "plain-paratha-pack",
    description: "Layered parathas cooked fresh and packed for quick breakfasts.",
    shortDescription: "Flaky everyday parathas",
    category: categories[0]._id,
    price: 219,
    discountPrice: 179,
    stock: 90,
    images: makeImages([
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200&q=80",
      "https://images.unsplash.com/photo-1617692855027-33b14f061079?w=1200&q=80",
      "https://images.unsplash.com/photo-1626509653293-6e4f8d0d29f2?w=1200&q=80",
    ]),
    featured: true,
    bestseller: false,
    ratings: 4.6,
  },
  {
    title: "Methi Thepla",
    slug: "methi-thepla",
    description: "Gujarati thepla made with fenugreek leaves and warm spices.",
    shortDescription: "Travel-friendly thepla pack",
    category: categories[0]._id,
    price: 199,
    discountPrice: 159,
    stock: 110,
    images: makeImages([
      "https://images.unsplash.com/photo-1617692855027-33b14f061079?w=1200&q=80",
      "https://images.unsplash.com/photo-1604908177522-4035fae7fe4d?w=1200&q=80",
      "https://images.unsplash.com/photo-1574653853027-7d4f2d8b9f4f?w=1200&q=80",
    ]),
    featured: false,
    bestseller: true,
    ratings: 4.5,
  },
  {
    title: "Aloo Bhujia",
    slug: "aloo-bhujia",
    description: "Crispy potato sev with a spicy kick, perfect for everyday snacking.",
    shortDescription: "Crunchy potato snack",
    category: categories[1]._id,
    price: 159,
    discountPrice: 129,
    stock: 220,
    images: makeImages([
      "https://images.unsplash.com/photo-1626082895617-2c6b485efb1c?w=1200&q=80",
      "https://images.unsplash.com/photo-1605475124836-bf0b6f6de3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1519869325930-281384150729?w=1200&q=80",
    ]),
    featured: true,
    bestseller: true,
    ratings: 4.8,
  },
  {
    title: "Masala Peanuts",
    slug: "masala-peanuts",
    description: "Roasted peanuts coated in a bold gram flour masala shell.",
    shortDescription: "Protein-rich crunchy snack",
    category: categories[1]._id,
    price: 179,
    discountPrice: 139,
    stock: 180,
    images: makeImages([
      "https://images.unsplash.com/photo-1519869325930-281384150729?w=1200&q=80",
      "https://images.unsplash.com/photo-1605475124836-bf0b6f6de3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1626185913540-0c9a0d95b9b6?w=1200&q=80",
    ]),
    featured: false,
    bestseller: true,
    ratings: 4.4,
  },
  {
    title: "Punjabi Mathri",
    slug: "punjabi-mathri",
    description: "Flaky mathri seasoned with ajwain, pepper, and desi ghee.",
    shortDescription: "Tea-time crisp snack",
    category: categories[1]._id,
    price: 209,
    discountPrice: 169,
    stock: 160,
    images: makeImages([
      "https://images.unsplash.com/photo-1613145997970-db84a7975fbb?w=1200&q=80",
      "https://images.unsplash.com/photo-1627247072729-c6f2f1c3a7d5?w=1200&q=80",
      "https://images.unsplash.com/photo-1618213837799-25d5552820d3?w=1200&q=80",
    ]),
    featured: false,
    bestseller: false,
    ratings: 4.3,
  },
  {
    title: "Cornflakes Mixture",
    slug: "cornflakes-mixture",
    description: "A festive mix of sev, cornflakes, peanuts, and curry leaves.",
    shortDescription: "Festive namkeen mix",
    category: categories[1]._id,
    price: 189,
    discountPrice: 149,
    stock: 190,
    images: makeImages([
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&q=80",
      "https://images.unsplash.com/photo-1626082895617-2c6b485efb1c?w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
    ]),
    featured: false,
    bestseller: false,
    ratings: 4.2,
  },
  {
    title: "Paneer Butter Masala",
    slug: "paneer-butter-masala",
    description: "Creamy tomato gravy with soft paneer cubes and rich butter flavor.",
    shortDescription: "Classic North Indian curry",
    category: categories[2]._id,
    price: 349,
    discountPrice: 299,
    stock: 80,
    images: makeImages([
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=80",
      "https://images.unsplash.com/photo-1604908554162-45f9a21a5f55?w=1200&q=80",
    ]),
    featured: true,
    bestseller: true,
    ratings: 4.8,
  },
  {
    title: "Veg Biryani",
    slug: "veg-biryani",
    description: "Fragrant basmati rice layered with vegetables, herbs, and biryani spices.",
    shortDescription: "Aromatic mixed veg biryani",
    category: categories[2]._id,
    price: 399,
    discountPrice: 329,
    stock: 75,
    images: makeImages([
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=80",
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    ]),
    featured: true,
    bestseller: false,
    ratings: 4.7,
  },
  {
    title: "Dal Tadka",
    slug: "dal-tadka",
    description: "Tempered yellow dal cooked with garlic, cumin, and fresh coriander.",
    shortDescription: "Comforting lentil curry",
    category: categories[2]._id,
    price: 259,
    discountPrice: 219,
    stock: 95,
    images: makeImages([
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80",
      "https://images.unsplash.com/photo-1604908554162-45f9a21a5f55?w=1200&q=80",
      "https://images.unsplash.com/photo-1604908177522-4035fae7fe4d?w=1200&q=80",
    ]),
    featured: false,
    bestseller: true,
    ratings: 4.6,
  },
  {
    title: "Rajma Curry",
    slug: "rajma-curry",
    description: "Slow-cooked kidney beans in a rich onion-tomato gravy.",
    shortDescription: "Classic homestyle rajma",
    category: categories[2]._id,
    price: 279,
    discountPrice: 239,
    stock: 85,
    images: makeImages([
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=80",
      "https://images.unsplash.com/photo-1617692855027-33b14f061079?w=1200&q=80",
    ]),
    featured: false,
    bestseller: false,
    ratings: 4.4,
  },
  {
    title: "Chicken Curry",
    slug: "chicken-curry",
    description: "Homestyle chicken curry with bold spices and a silky onion gravy.",
    shortDescription: "Rich and flavorful curry",
    category: categories[2]._id,
    price: 449,
    discountPrice: 389,
    stock: 60,
    images: makeImages([
      "https://images.unsplash.com/photo-1604908177522-4035fae7fe4d?w=1200&q=80",
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=80",
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80",
    ]),
    featured: false,
    bestseller: true,
    ratings: 4.7,
  },
  {
    title: "Besan Ladoo",
    slug: "besan-ladoo",
    description: "Classic gram flour laddoos roasted in ghee with cardamom and nuts.",
    shortDescription: "Traditional ghee sweet",
    category: categories[3]._id,
    price: 299,
    discountPrice: 249,
    stock: 130,
    images: makeImages([
      "https://images.unsplash.com/photo-1605197135868-b769ea8e09f5?w=1200&q=80",
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=80",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
    ]),
    featured: true,
    bestseller: true,
    ratings: 4.9,
  },
  {
    title: "Kesar Peda",
    slug: "kesar-peda",
    description: "Soft milk peda infused with saffron, cardamom, and a rich festive aroma.",
    shortDescription: "Festive saffron peda",
    category: categories[3]._id,
    price: 349,
    discountPrice: 299,
    stock: 105,
    images: makeImages([
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=80",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
    ]),
    featured: false,
    bestseller: true,
    ratings: 4.8,
  },
  {
    title: "Rasgulla Box",
    slug: "rasgulla-box",
    description: "Spongy chenna balls soaked in light sugar syrup and packed fresh.",
    shortDescription: "Soft syrupy Bengali sweet",
    category: categories[3]._id,
    price: 279,
    discountPrice: 229,
    stock: 115,
    images: makeImages([
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&q=80",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80",
      "https://images.unsplash.com/photo-1605197135868-b769ea8e09f5?w=1200&q=80",
    ]),
    featured: false,
    bestseller: false,
    ratings: 4.5,
  },
  {
    title: "Chocolate Brownie",
    slug: "chocolate-brownie",
    description: "Fudgy baked brownie with a deep cocoa flavor and gooey center.",
    shortDescription: "Rich baked dessert",
    category: categories[3]._id,
    price: 229,
    discountPrice: 189,
    stock: 90,
    images: makeImages([
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&q=80",
      "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=1200&q=80",
    ]),
    featured: true,
    bestseller: false,
    ratings: 4.6,
  },
  {
    title: "Mango Kulfi",
    slug: "mango-kulfi",
    description: "Creamy frozen kulfi blended with ripe mango pulp and cardamom.",
    shortDescription: "Summer mango dessert",
    category: categories[3]._id,
    price: 249,
    discountPrice: 209,
    stock: 100,
    images: makeImages([
      "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=1200&q=80",
      "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1200&q=80",
      "https://images.unsplash.com/photo-1606305032107-61cc8545dffb?w=1200&q=80",
    ]),
    featured: false,
    bestseller: true,
    ratings: 4.7,
  },
];

const seedData = async () => {
  try {
    await connectDB();
    
    console.log("Clearing existing data...");
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    console.log("Creating Admin User...");
    await User.create({
      name: "Admin Savora",
      email: "admin@savora.com",
      password: "password123",
      phone: "9876543210",
      role: "ADMIN"
    });

    console.log("Creating Test User...");
    await User.create({
      name: "Test User",
      email: "user@savora.com",
      password: "password123",
      phone: "1234567890",
      role: "USER"
    });

    console.log("Creating Categories...");
    const createdCategories = await Category.insertMany(dummyCategories);

    console.log("Creating Products...");
    await Product.insertMany(dummyProducts(createdCategories));

    console.log("Data Seeded Successfully! 🌱");
    process.exit();
  } catch (error) {
    console.error("Seeding Error: ", error);
    process.exit(1);
  }
};

seedData();
