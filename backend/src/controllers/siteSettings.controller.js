import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SiteSettings } from "../models/siteSettings.model.js";

const DEFAULT_SETTINGS = {
  key: "global",
  announcementBarEnabled: true,
  announcementBarText: "Free Shipping on orders above ₹999 | Use code SAVORA10 for 10% off",
};

export const getSiteSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne({ key: "global" });

  if (!settings) {
    settings = await SiteSettings.create(DEFAULT_SETTINGS);
  }

  return res.status(200).json(
    new ApiResponse(200, settings, "Site settings fetched successfully")
  );
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const { announcementBarEnabled, announcementBarText } = req.body;

  const updates = {};
  if (announcementBarEnabled !== undefined) {
    updates.announcementBarEnabled = announcementBarEnabled === true || announcementBarEnabled === "true";
  }
  if (announcementBarText !== undefined) {
    const text = String(announcementBarText).trim();
    if (!text) {
      throw new ApiError(400, "announcementBarText cannot be empty");
    }
    updates.announcementBarText = text;
  }

  const settings = await SiteSettings.findOneAndUpdate(
    { key: "global" },
    { $set: updates, $setOnInsert: DEFAULT_SETTINGS },
    { new: true, upsert: true }
  );

  return res.status(200).json(
    new ApiResponse(200, settings, "Site settings updated successfully")
  );
});