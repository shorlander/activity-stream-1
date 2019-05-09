class _PrerenderData {
  constructor(options) {
    this.initialPrefs = options.initialPrefs;
    this.initialSections = options.initialSections;
    this._setValidation(options.validation);
  }

  get validation() {
    return this._validation;
  }

  set validation(value) {
    this._setValidation(value);
  }

  get invalidatingPrefs() {
    return this._invalidatingPrefs;
  }

    // This is needed so we can use it in the constructor
  _setValidation(value = []) {
    this._validation = value;
    this._invalidatingPrefs = value.reduce((result, next) => {
      if (typeof next === "string") {
        result.push(next);
        return result;
      } else if (next && next.oneOf) {
        return result.concat(next.oneOf);
      } else if (next && next.indexedDB) {
        return result.concat(next.indexedDB);
      } else if (next && next.jsonPrefs) {
        return result.concat(next.jsonPrefs);
      }
      throw new Error("Your validation configuration is not properly configured");
    }, []);
  }

  _isPrefEnabled(prefObj) {
    try {
      let data = JSON.parse(prefObj);
      return (data && data.enabled) ? true : false; // eslint-disable-line no-unneeded-ternary
    } catch (e) {
      return false;
    }
  }

  arePrefsValid(getPref, indexedDBPrefs) {
    for (const prefs of this.validation) {
      // {oneOf: ["foo", "bar"]}
      if (prefs && prefs.oneOf && !prefs.oneOf.some(name => getPref(name) === this.initialPrefs[name])) {
        return false;

        // {indexedDB: ["foo", "bar"]}
      } else if (indexedDBPrefs && prefs && prefs.indexedDB) {
        const anyModifiedPrefs = prefs.indexedDB.some(prefName => indexedDBPrefs.some(pref => pref && pref[prefName]));
        if (anyModifiedPrefs) {
          return false;
        }
        // {jsonPrefs: ["foo", "bar"]}
      } else if (prefs && prefs.jsonPrefs) {
        const isPrefModified =
          prefs.jsonPrefs.some(name => this._isPrefEnabled(getPref(name)) !== this.initialPrefs[name].enabled);
        if (isPrefModified) {
          return false;
        }
        // "foo"
      } else if (getPref(prefs) !== this.initialPrefs[prefs]) {
        return false;
      }
    }
    return true;
  }
}

this.PrerenderData = new _PrerenderData({
  initialPrefs: {
    "feeds.topsites": true,
    "showSearch": true,
    "topSitesRows": 1,
    "feeds.section.topstories": true,
    "feeds.section.highlights": true,
    "sectionOrder": "topsites,topstories,highlights",
    "collapsed": false,
    "discoverystream.config": {"enabled": false},
  },
  // Prefs listed as invalidating will prevent the prerendered version
  // of AS from being used if their value is something other than what is listed
  // here. This is required because some preferences cause the page layout to be
  // too different for the prerendered version to be used. Unfortunately, this
  // will result in users who have modified some of their preferences not being
  // able to get the benefits of prerendering.
  validation: [
    "feeds.topsites",
    "showSearch",
    "topSitesRows",
    "sectionOrder",
    // This means if either of these are set to their default values,
    // prerendering can be used.
    {oneOf: ["feeds.section.topstories", "feeds.section.highlights"]},
    // If any component has the following preference set to `true` it will
    // invalidate the prerendered version.
    {indexedDB: ["collapsed"]},
    // For below prefs, parse value to check enabled property. If enabled property
    // differs from initial prefs enabled value, prerendering cannot be used
    {jsonPrefs: ["discoverystream.config"]},
  ],
  initialSections: [
    {
      enabled: true,
      icon: "pocket",
      id: "topstories",
      order: 1,
      title: {id: "header_recommended_by", values: {provider: "Pocket"}},
    },
    {
      enabled: true,
      id: "highlights",
      icon: "highlights",
      order: 2,
      title: {id: "header_highlights"},
    },
  ],
});

this._PrerenderData = _PrerenderData;
const EXPORTED_SYMBOLS = ["PrerenderData", "_PrerenderData"];
