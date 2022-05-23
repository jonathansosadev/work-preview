/**
 * Implementation of the bar rating plugin withour javascript
 * 
 * 
 * 
 */
(function() {
  /// PLUGIN CODE ///
  function _getSelect(el) {
    if (el.tagName === 'SELECT') return el;
    var children = el.children || [];
    for (var i = 0; i < children.length; i++) {
      var s = _getSelect(children[0]);
      if (s) return s;
    }
    return null;
  }

  function StarRating (el, question) {
    this.containerId = Date.now();
    this.select = _getSelect(el);
    this.el = el;
    this.domContainer = null;
    this.domStars = [];
    this.question = question;
    this.showWidget(question.value || question.defaultValue);
  }

  // change the rating and the starts
  StarRating.prototype.setRating = function (rating) {
    this.domContainer.className = 'rating-global-'+rating;
    this.select.value=rating;
    this.question.value=rating;
  }
  // hides the select and shows the stars
  StarRating.prototype.showWidget = function (currentRating, options) {
    this.select.style.display = 'none';
    this.domContainer
    this.domContainer = document.createElement("DIV");
    this.domContainer.id = this.containerId;
    this.domContainer.className = 'rating-global-'+currentRating;
    this.el.lastChild.appendChild(this.domContainer);
    
    var minText = document.createElement("SPAN");
    minText.className = "sv_s_rating_min_text";
    minText.innerHTML = this.question.minRateDescription;
    this.domContainer.appendChild(minText);

    for (var i = 1; i < 6; i++) {
      var s = document.createElement("DIV");
      this.domContainer.appendChild(s);
      var r = document.createElement("DIV");
      r.className="rating-star-sub rating-star-sub-"+i;
      s.appendChild(r);
      /*var rr = document.createElement("SPAN");
      rr.appendChild(document.createTextNode(i));
      rr.className="rating-star-sub-big";
      r.appendChild(rr);
      r.appendChild(document.createTextNode(' /5'));*/
      s.id = this.containerId+'-'+i;
      s.className = 'rating-star rating-star-'+i;
      this.domContainer.appendChild(s);
      s.onclick = function(rating) {
        this.setRating(rating*2);
        return false;
      }.bind(this, i);
      this.domStars.push(s);
    }

    var maxText = document.createElement("SPAN");
    maxText.className = "sv_s_rating_max_text";
    maxText.innerHTML = this.question.maxRateDescription;
    this.domContainer.appendChild(maxText);
  }
  
  /// PLUGIN INIT ///
  function init(Survey) {
    var widget = {
      name: "starrating",
      title: "Star rating",
      iconName: "icon-starrating",
      widgetIsLoaded: function () {
        return !!StarRating;
      },
      defaultJSON: { choices: [2, 4, 6, 8, 10] },
      isFit: function (question) {
        return question.getType() === "starrating";
      },
      isDefaultRender: true,
      activatedByChanged: function (activatedBy) {
        Survey.JsonObject.metaData.addClass(
          "starrating",
          [
            { name: "hasOther", visible: false },
            { name: "otherText", visible: false },
            { name: "optionsCaption", visible: false },
            { name: "otherErrorText", visible: false },
            { name: "storeOthersAsComment", visible: false },
            { name: "renderAs", visible: false }
          ],
          null,
          "dropdown"
        );
        Survey.JsonObject.metaData.addProperties("starrating", [
          {
            name: "showValues:boolean",
            default: false
          },
          {
            name: "minRateDescription",
            default: ""
          },
          {
            name: "maxRateDescription",
            default: ""
          }
        ]);
      },
      afterRender: function (question, el) {
        var sr = new StarRating(el, question);
        question.valueChangedCallback = function () {
          sr.setRating(question.value);
        };
        question.__starratingOnPropertyChangedCallback = function (
          sender,
          options
        ) {
          console.log('__starratingOnPropertyChangedCallback', sender, options)
        };
        question.onPropertyChanged.add(
          question.__starratingOnPropertyChangedCallback
        );
      },
      willUnmount: function (question, el) {
        // TODO CLEAN
        el.innerHTML = null;
        question.valueChangedCallback = undefined;
        question.onPropertyChanged.remove(
          question.__starratingOnPropertyChangedCallback
        );
        question.__starratingOnPropertyChangedCallback = undefined;
      }
    };
  
    Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "customtype");
  }
  
  if (typeof Survey !== "undefined") {
    init(Survey);
  }
  })();