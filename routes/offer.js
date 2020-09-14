// express
const express = require("express");
const router = express.Router();

// Gestion de Cloudinary
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Import des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

// Import du middleware
const isAuthenticated = require("../middlewares/isAuthenticated");

// Route pour créer une publication
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  console.log("route : /offer/publish");
  try {
    if (500 < req.fields.description.length) {
      return res.status(400).json("Description must be 500 character max.");
    } else if (50 < req.fields.title) {
      return res.status(400).json("Title must be 50 character max.");
    } else if (10000 < req.fields.price) {
      return res.status(400).json("Price can't be higher then 10000€.");
    } else {
      // Gestion de la photo
      try {
        let pictureToUpload = req.files.picture.path;
        const pictureUploaded = await cloudinary.uploader.upload(
          pictureToUpload
        );
        picture = pictureUploaded;
      } catch (error) {
        return res.json({ error: error.message });
      }
      newOffer = new Offer({
        creator: req.user,
        description: req.fields.description,
        picture: picture,
        price: req.fields.price,
        title: req.fields.title,
      });
      await newOffer.save();
      res.status(201).json({
        _id: newOffer._id,
        title: newOffer.title,
        description: newOffer.description,
        price: newOffer.price,
        created: newOffer.created,
        creator: {
          account: newOffer.creator.account,
          _id: newOffer.creator._id,
        },
        picture: newOffer.picture,
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour afficher les annonces
router.get("/offer", async (req, res) => {
  console.log("Route : /offer");
  try {
    const offers = await Offer.find({ price: { $gte: 100 } }).sort({
      title: "desc",
    });
    res.status(200).json(offers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route tri d'annonce en query
router.get("/offer/with-count", async (req, res) => {
  console.log("route : /offer/with-count query");
  try {
    const title = req.query.title;
    const priceMin = Number(req.query.priceMin);
    const priceMax = Number(req.query.priceMax);
    const sort = req.query.sort;
    const page = Number(req.query.page);

    const filtering = {};
    const sorting = {};
    const offerPerPage = 4;

    if (title) {
      filtering.title = new RegExp(title, "i");
    }
    if (priceMin) {
      filtering.price = { $gte: priceMin };
    }

    if (priceMax) {
      if (filtering.price) {
        filtering.price.$lte = priceMax;
      } else {
        filtering.price = { $lte: priceMax };
      }
    }
    if (sort) {
      if (sort === "price-desc") {
        sorting.price = "desc";
      } else if (sort === "price-asc") {
        sorting.price = "asc";
      } else if (sort === "date-desc") {
        sorting.created = "desc";
      } else if (sort === "date-asc") {
        sorting.created = "asc";
      }
    }

    const offersSorted = await Offer.find(filtering)
      .sort(sorting)
      .limit(offerPerPage)
      .skip((page - 1) * offerPerPage)
      .populate({
        path: "creator",
        select: "account.username account.phone",
      });

    const count = await Offer.countDocuments(filtering);

    res.status(200).json({ count, offersSorted });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour modifier une annonce
router.put("/offer/modify", isAuthenticated, async (req, res) => {
  console.log("Route : /offer/modify");
  try {
    const offerToModify = await Offer.findOne({
      _id: req.fields.id,
    });
    if (offerToModify.creator.toString() !== req.user._id.toString()) {
      res.status(400).json("You can only modify your offer !");
    } else {
      if (req.fields.description) {
        if (500 < req.fields.description.length) {
          return res.status(400).json("Description must be 500 character max.");
        } else {
          offerToModify.description = req.fields.description;
        }
      }
      if (req.fields.price) {
        if (10000 < req.fields.price) {
          return res.status(400).json("Price can't be higher then 10000€.");
        } else {
          offerToModify.price = req.fields.price;
        }
      }
      if (req.fields.title) {
        if (50 < req.fields.title) {
          return res.status(400).json("Title must be 50 character max.");
        } else {
          offerToModify.title = req.fields.title;
        }
      }
      await offerToModify.save();
      res.status(202).json("Offer modified succesfully !");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour supprimer une annonce
router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  console.log("route : /offer/delete");
  try {
    offerToDelete = await Offer.findOne({
      _id: req.fields.id,
    });
    await offerToDelete.delete();
    res.status(202).json("Offer deleted succesfully !");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour récupérer les détails d'une offre en fonction de son ID
router.get("/offer/:id", async (req, res) => {
  console.log("route : /offer/param");
  try {
    offerToDisplay = await Offer.findById(req.params.id).populate({
      path: "creator",
      select: "account.username account.phone",
    });

    res.status(200).json({
      _id: offerToDisplay._id,
      title: offerToDisplay.title,
      description: offerToDisplay.description,
      price: offerToDisplay.price,
      picture: offerToDisplay.picture,
      creator: offerToDisplay.creator,
      created: offerToDisplay.created,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export des routes
module.exports = router;
