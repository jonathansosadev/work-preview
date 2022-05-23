const GsApiInterface = require('./GsApiInterface');

module.exports = class GarageGlobalData extends GsApiInterface {
  static async Garage(app, garageId, returnRaw = false) {
    const rawGarage = await this._fetchGarageFromId(app, garageId);

    if (!rawGarage) {
      throw new Error(`No garage found for id ${garageId}`);
    }
    return returnRaw ? rawGarage : await this._prepareGarageForPublic(app, rawGarage);
  }

  static async garageFromSlug(app, garageSlug, returnRaw = false) {
    const rawGarage = await this._fetchGarageFromSlug(app, garageSlug);

    if (!rawGarage) {
      throw new Error(`No garage found for slug ${garageSlug}`);
    }
    return returnRaw ? rawGarage : await this._prepareGarageForPublic(app, rawGarage);
  }

  // /////////////////////////////////////////////////
  // /               PRIVATE METHODS               ///
  // /////////////////////////////////////////////////

  static _fetchGarageFromSlug(app, garageSlug) {
    return new Promise((resolve, reject) =>
      app.models.Garage.findOne({ where: { slug: garageSlug } }, (e, g) => (e ? reject(e) : resolve(g)))
    );
  }

  static _fetchGarageFromId(app, garageId) {
    return new Promise((resolve, reject) =>
      app.models.Garage.findById(garageId.toString(), (e, g) => (e ? reject(e) : resolve(g)))
    );
  }

  static _fetchGaragePublicScores(app, garageId) {
    return new Promise((resolve, reject) =>
      app.models.Garage.findPublicScores(garageId.toString(), null, null, null, true, (e, p) =>
        e ? reject(e) : resolve(p)
      )
    );
  }

  static async _prepareGarageForPublic(app, rawGarage) {
    const publicScores = await this._fetchGaragePublicScores(app, rawGarage.id);
    const publicGarage = this.__prepareGarageSimpleFields(rawGarage);

    this.__prepareGarageLogos(publicGarage, rawGarage);
    this.__prepareGarageRating(publicGarage, rawGarage, publicScores);
    this.__prepareGarageLinks(publicGarage, rawGarage);
    return publicGarage;
  }

  static __prepareGarageSimpleFields(rawGarage) {
    return {
      garageId: rawGarage.id.toString(),
      type: rawGarage.type,
      respondentsCount: 0,
      rating: 0,
      name: rawGarage.publicDisplayName,
      group: rawGarage.group,
      streetAddress: rawGarage.streetAddress,
      city: rawGarage.city,
      postalCode: rawGarage.postalCode,
      region: rawGarage.region,
      businessId: rawGarage.businessId,
      subRegion: rawGarage.subRegion,
      latitude: rawGarage.googlePlace && rawGarage.googlePlace.latitude,
      longitude: rawGarage.googlePlace && rawGarage.googlePlace.longitude,
      brandNames: rawGarage.brandNames,
      networkTypeDisplayName: rawGarage.type, // networkTypeDisplayName is a legacy field
      url: `${process.env.WWW_URL}/garage/${rawGarage.slug}`,
      noIndex: rawGarage.hideDirectoryPage,
      openingHours: (rawGarage.googlePlace && rawGarage.googlePlace.openingHours) || null,
      googleWebsiteUrl: (rawGarage.googlePlace && rawGarage.googlePlace.website) || null,
      phone: rawGarage.phone || null,
      links: rawGarage.links || null,
      id: rawGarage.id,
      locale: rawGarage.locale,
      timezone: rawGarage.timezone,
      securedDisplayName: rawGarage.securedDisplayName,
      shareReviews: rawGarage.shareReviews,
      stopShareReviewsAt: rawGarage.stopShareReviewsAt,
      subscriptions: rawGarage.subscriptions,
      slug: rawGarage.slug,
      certificateWording: rawGarage.certificateWording,
    };
  }

  static __prepareGarageLogos(publicGarage, rawGarage) {
    if (rawGarage.logoDirectoryPage) {
      publicGarage.brandLogos = rawGarage.logoDirectoryPage.map((logo) => this.$getLogoPath(logo));
    } else {
      publicGarage.brandLogos = rawGarage.brandNames.map((brandLogo) => this.$brandLogo(brandLogo));
    }
  }

  static __prepareGarageRating(publicGarage, rawGarage, publicScores) {
    if (publicScores && publicScores.length > 0) {
      for (const publicScore of publicScores) {
        publicGarage.rating +=
          publicScore.payload.rating.global.value * publicScore.payload.rating.global.respondentsCount;
        publicGarage.respondentsCount += publicScore.payload.rating.global.respondentsCount;
        publicGarage[publicScore.type] = {
          rating: Math.round(publicScore.payload.rating.global.value * 10) / 10,
          respondentsCount: publicScore.payload.rating.global.respondentsCount,
        };
      }
      publicGarage.rating = Math.round((10 * publicGarage.rating) / publicGarage.respondentsCount) / 10;
    }
  }

  static __prepareGarageLinks(publicGarage, rawGarage) {
    if (rawGarage.links && rawGarage.links.length > 0) {
      for (const link of rawGarage.links) {
        if (link.name === 'appointment') {
          publicGarage.urlAppointment = link.url;
        } else if (link.name === 'contact') {
          publicGarage.urlContact = link.url;
        }
      }
    }
  }
};
