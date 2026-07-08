import SiteSettings from "../models/siteSettings.model.js";

const DEFAULTS = { uploadProvider: "imagekit" };

export class SettingsService {
    static async get() {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create(DEFAULTS);
        }
        return settings;
    }

    static async update(data) {
        const settings = await this.get();
        if (data.uploadProvider) {
            settings.uploadProvider = data.uploadProvider;
        }
        await settings.save();
        return settings;
    }
}
