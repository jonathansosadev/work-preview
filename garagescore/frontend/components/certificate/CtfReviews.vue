<template>
  <section :class="'reviews' + ' ' + (useCusteedHeader ? 'custeedContext' : '')">
    <div class="view-more-container text-right"
         v-if="filterByType && garage[selectedServiceType] && garage[selectedServiceType].respondentsCount">
      <strong>1 - {{ displayedItemsCount() }}</strong>
      {{ $t_locale('components/certificate/CtfReviews')('reviewsOutOf') }} <strong>{{ garage[selectedServiceType] && garage[selectedServiceType].respondentsCount }}</strong>
    </div>
    <div class="row review" v-for="review in displayedReviews" itemprop="review" itemscope
         itemtype="http://schema.org/Review" :data-submittedAt="review.submittedAt_time">
      <div class=" col-xs-12">
        <div class="review-score" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating"
             :style="{ backgroundImage: 'url(' + getMiniTrophyBackgroundUrl(review.score) + ')' }">
          <meta itemprop="worstRating" content="0">
          <span itemprop="ratingValue">{{ review.score_fr | frenchFloating}}</span>
          <meta itemprop="bestRating" content="10">
        </div>
        <div class="review-info">
                    <span itemprop="author" itemscope itemtype="http://schema.org/Person">
                        <span class="review-author" itemprop="name">{{ review.authorPublicDisplayName }}</span>
                        <span v-if="review.authorCityPublicDisplayName">&nbsp;{{ $t_locale('components/certificate/CtfReviews')('at') }} <span class="review-city" itemprop="address">{{ review.authorCityPublicDisplayName }}</span></span>
                    </span>
          <br>
          <span class="review-date" itemprop="datePublished" :content="review.metaDate"><i>{{ $dd(new Date(review.metaDate), 'long') }}</i></span>
          <StarsScore class="star-container" :score="review.score / 2" ></StarsScore>
        </div>
        <div class="review-comment" itemprop="reviewBody" v-if="review.moderation">{{ review.moderation }}</div>
        <div class="review-comment" itemprop="reviewBody" v-else>{{ review.comment }}</div>
        <div class="review-transaction">{{ review.transactionPublicDisplayName && review.transactionPublicDisplayName.map((c) => $t_locale('components/certificate/CtfReviews')(c)).join(' / ') }}</div>
        <div class="review-vehicle">
          {{ review.vehicleMakePublicDisplayName }}
          <span v-if="review.vehicleMakePublicDisplayName && review.vehicleModelPublicDisplayName">/</span>
          {{ review.vehicleModelPublicDisplayName }}
        </div>
        <div class="review-reply" v-if="review.reply && review.reply.status === 'Approved'">
          <div class="review-reply-inner">
            <div class="review-reply-caret" style="top: 0">
              <i class="icon-gs-right"></i>
            </div>
            <div class="review-reply-body" :style="{height: review.showReply ? 'auto' : '58px'}" :id="'ror-' + review.id">
              <span class="reply-title">{{$t_locale('components/certificate/CtfReviews')('garageAnswer')}} </span> <br>
              <span><i> {{ $dd(new Date(review.reply.approvedAt), 'long') }} </i></span> <br>
              {{ review.reply.text }}
            </div>
            <span v-if="!review.showReply && review.replyHasMore" v-on:click="showReplyFn(review)" class="show-more">
                {{ $t_locale('components/certificate/CtfReviews')('seeMore')}} <i class="icon-gs-down"></i>
            </span>
          </div>
        </div>
        <div class="review-client-reply" v-if="review.followupUnsatisfiedStatus">
          <div class="review-client-reply-inner">
            <div class="review-reply-caret" style="top: 0">
              <i class="icon-gs-like"></i>
            </div>
            <div class="review-reply-body">
              {{ $dd(review.followupRespondedAt, 'long') }}, {{ $t_locale('components/certificate/CtfReviews')('clientTold') }}
            </div>
          </div>
        </div>
        <br>
      </div>
    </div>
    <div class="bottom-border">
      <div class="loading-container">
        <i class="icon-gs-loading" v-if="loadingMore"></i>
      </div>
      <div class="text-right"
           v-if="filterByType && garage[selectedServiceType] && garage[selectedServiceType].respondentsCount">
        <strong>1 - {{ displayedItemsCount() }}</strong>
        {{ $t_locale('components/certificate/CtfReviews')('reviewsOutOf') }} <strong>{{ garage[selectedServiceType] && garage[selectedServiceType].respondentsCount }}</strong>
      </div>
    </div>
    <div class="view-more-container">
            <span class="view-more" v-if="hasMore()" v-on:click="loadMore">
                {{ $t_locale('components/certificate/CtfReviews')('seeMoreReviews') }} <i class="icon-gs-down"></i>
            </span>
    </div>
  </section>
</template>

<script>
  import Vue from 'vue';
  import GarageTypes from '../../../common/models/garage.type.js';

  export default {
    props: {
      useCusteedHeader: Boolean
    },
    data() {
      return {
        displayedReviewPerPage: 150,
        displayedReviews: [],
        filterByType: false,
        loadingMore: false,
        currentPage: {
          Maintenance: 0,
          NewVehicleSale: 0,
          UsedVehicleSale: 0,
          VehicleInspection: 0
        },
        GarageTypes
      };
    },
    created() {
      // This defines the reviews that will be included in the source code of the page.
      // It is important for the SEO, so it must be kept
      this.displayedReviews = [].concat(...Object.keys(this.reviewsByType).map(type => this.reviewsByType[type]));
    },
    mounted() {
      this.displayedReviewPerPage = 10;
      this.filterByType = true;
      if (this.reviewsByType[this.selectedServiceType]) {
        this.displayedReviews = this.reviewsByType[this.selectedServiceType].slice(0, this.displayedReviewPerPage);
        if (this.displayedReviews.length < this.displayedItemsCount()) {
          this.loadReviews(this.currentPage[this.selectedServiceType] || 1, this.displayedReviewPerPage);
        }
      }
    },
    updated() {
      const leftBlock = document.getElementsByClassName('left-block')[0];
      const rightBlock = document.getElementsByClassName('right-block')[0];

      rightBlock.style.height = leftBlock.offsetHeight + 'px';

      const replyElements = document.getElementsByClassName('review-reply-inner');
      for (let i = 0; i < replyElements.length; i++) {
        const ele = replyElements[i];
        const children = ele.children;
        if (!children || !children[1]) {
          continue;
        }
        const style = window.getComputedStyle(children[1], null);
        children[0].style.paddingTop = ((style.height.replace('px', '') - 20) / 2) + 'px';
      }
      this.displayedReviews.forEach(review => {
        if (review.reply && review.reply.status === 'Approved') {
          const replyElement = document.getElementById('ror-' + review.id);
          if (replyElement.scrollHeight > 60) {
            Vue.set(review, 'replyHasMore', true);
          }
        }
      });
      this.adjustRightBlock();
    },
    methods: {
      displayedItemsCount() {
        const respondantCount = this.garage[this.selectedServiceType] ? this.garage[this.selectedServiceType].respondentsCount : 0;
        return Math.min(respondantCount, (this.currentPage[this.selectedServiceType] || 1) * this.displayedReviewPerPage);
      },
      hasMore() {
        const respondantCount = this.garage[this.selectedServiceType] ? this.garage[this.selectedServiceType].respondentsCount : 0;
        return respondantCount > (this.currentPage[this.selectedServiceType] || 1) * this.displayedReviewPerPage;
      },
      loadMore() {
        if (this.loadingMore) return;
        const respondantCount = this.garage[this.selectedServiceType] ? this.garage[this.selectedServiceType].respondentsCount : 0;
        if (respondantCount > (this.currentPage[this.selectedServiceType] || 1) * this.displayedReviewPerPage) {
          this.loadReviews(this.currentPage[this.selectedServiceType] + 1, this.displayedReviewPerPage !== 50 ? 50 : this.displayedReviewPerPage);
        }
      },
      showReplyFn(review) {
        Vue.set(review, 'showReply', true);
      },
      loadReviews(page, pageSize) {
        if (this.loadingMore) return;
        if (this.$bar) this.$bar.start();
        this.loadingMore = true;
        this.$store.dispatch('certificate/FETCH_REVIEWS', {
          slug: this.$route.params.slug,
          type: this.selectedServiceType,
          page: page,
          pageSize: pageSize
        }).then(() => {
          this.loadingMore = false;
          if (this.$bar) this.$bar.finish();
          this.currentPage[this.selectedServiceType] = page;
          this.displayedReviewPerPage = pageSize;
          this.displayedReviews = this.reviewsByType[this.selectedServiceType];
        });
      },
      adjustRightBlock() {
        const scrollTop = document.getElementsByTagName('body')[0].scrollTop || document.getElementsByTagName('html')[0].scrollTop;
        let bottomOfLeftBlock = 0;
        let theoricBottomOfContact = 0;
        if (document.getElementsByClassName('left-block')[0]) {
          bottomOfLeftBlock = document.getElementsByClassName('left-block')[0].offsetTop + document.getElementsByClassName('left-block')[0].offsetHeight - scrollTop - 50;
        }
        if (document.getElementsByClassName('contact')[0]) {
          theoricBottomOfContact = document.getElementsByClassName('contact')[0].offsetHeight + (window.innerWidth <= 991 ? 42 : 72);
        }
        if (scrollTop > this.scrollRef && theoricBottomOfContact <= bottomOfLeftBlock && this.$store.state.certificate.rightBlock !== 'middle') {
          this.$store.commit('certificate/SET_RIGHT_BLOCK', 'middle');
        } else if (theoricBottomOfContact > bottomOfLeftBlock && this.$store.state.certificate.rightBlock !== 'bottom') {
          this.$store.commit('certificate/SET_RIGHT_BLOCK', 'bottom');
        } else if (scrollTop <= this.scrollRef && this.$store.state.certificate.rightBlock !== 'top') {
          this.$store.commit('certificate/SET_RIGHT_BLOCK', 'top');
        }
      },
      getMiniTrophyBackgroundUrl(rating) {
        const rouderedRating = Math.round(rating * 2) / 2;
        return `/certificate/images/mini-trophy/${rouderedRating.toString().replace(/\./, ',')}.png`;
      },
      getStarBetween(min, max, ratio) {
        if (ratio <= min) {
          return '/certificate/images/stars/empty.png';
        }
        if (ratio >= max) {
          return '/certificate/images/stars/full.png';
        }
        return ratio >= ((min + max) / 2)
          ? '/certificate/images/stars/half.png'
          : '/certificate/images/stars/empty.png';
      },
      cleanTransactionName(transaction){
        return transaction.replace(/(, |)Autre(, |)/g, '');
      }
    },
    watch: {
      selectedServiceType(newSelectedServiceType) {
        this.displayedReviewPerPage = this.currentPage[newSelectedServiceType] ? 50 : 10;
        if (this.reviewsByType[this.selectedServiceType]) {
          this.displayedReviews = this.reviewsByType[this.selectedServiceType].slice(0, this.displayedReviewPerPage);
          if (this.displayedReviews.length < this.displayedItemsCount()) { // We can't fill a page with our reviews, so we'll load a page to begin with
            this.loadReviews(this.currentPage[newSelectedServiceType] || 1, this.displayedReviewPerPage);
          }
        }
      }
    },
    computed: {
      scrollRef() {
        return this.$store.state.certificate.scrollRef;
      },
      reviews() {
        return this.$store.state.certificate.reviews
      },
      garage() {
        return this.$store.state.certificate.garage
      },
      reviewsByType() {
        return this.$store.state.certificate.reviewsByType
      },
      selectedServiceType() {
        return this.$store.state.certificate.selectedServiceType
      },
      mainBackgroundUrl() {
        return this.$store.state.certificate.mainBackgroundUrl
      }
    }
  }
</script>

<style lang="scss" scoped>
  .reviews {
    min-height: 500px;
    padding-top: 10px;
    width: 100%;
    display: inline-block;
    color: #757575;
    .star-container {
      padding-left: 5px;
      display: inline-block;
      img {
        width: 15px;
      }
    }
    .review {
      margin-bottom: 10px;
    }
    .review-score {
      display: inline-block;
      width: 52px;
      height: 35px;
      text-align: center;
      
      font-size: 16px;
      background-size: contain;
      vertical-align: top;
      padding-top: 15px;
      background-repeat: no-repeat;
    }
    .review-info {
      display: inline-block;
      width: calc(100% - 55px);
      font-size: 14px;
      padding-left: 15px;
      color: #BCBCBC;
      .review-author {
        
        color: #757575;
      }
    }
    .review-comment {
      color: #009A8A;
      width: 100%;
      font-size: 16px;
      padding-top: 5px;
      text-align: justify;
    }
    .review-transaction {
      font-size: 12px;
      font-style: italic;
      color: #757575;
      padding-top: 5px;
      
    }
    .review-vehicle {
      font-size: 12px;
      font-style: italic;
      
      color: #757575;
    }
    .review-reply {
      margin-top: 10px;
      border-left: 1px solid #757575;
      .review-reply-inner {
        border-left: 3px solid #757575;
        margin-left: 2px;
        width: 100%;
        .review-reply-caret {
          display: inline-block;
          color: #757575;
          vertical-align: top;
          width: 0px;
          position: relative;
          padding-top: 10px;
          i {
            line-height: 20px;
            height: 20px;
          }
          left: -1px;
        }
        .review-reply-body {
          display: inline-block;
          vertical-align: top;
          text-align: justify;
          width: calc(100% - 20px);
          height: 58px;
          overflow: hidden;
          color: #BCBCBC;
          margin-left: 1rem;
          .reply-title {
            
            color: black;
          }
        }
      }
    }
    .review-client-reply {
      /*border-left: 1px solid #43b9ad;*/
      .review-client-reply-inner {
        /*border-left: 3px solid #43b9ad;*/
        /*margin-left: 2px;*/
        margin-top: 5px;
        .review-reply-caret {
          display: inline-block;
          color: #00B700;
          vertical-align: middle;
          width: 30px;
          position: relative;
          left: -1px;
          padding-top: 2px;
        }
        .review-reply-body {
          display: inline-block;
          vertical-align: top;
          text-align: justify;
          width: calc(100% - 30px);
          color: #00B700;
          padding-top: 6.5px;
          margin-left: 1rem;
        }
      }
    }
    .view-more:hover {
      cursor: pointer;
    }
    .view-more {
      float: right;
    }
    .bottom-border {
      border-bottom: 2px dotted #BCBCBC;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .view-more-container {
      display: inline-block;
      width: 100%;
      padding-bottom: 20px;
      height: 40px;
    }
    .loading-container {
      width: 50%;
      text-align: center;
    }
    .show-more {
      float: right;
      padding-top: 5px;
    }
    .show-more:hover {
      cursor: pointer;
    }
    @media (max-width: 480px) {
      .review-comment {
        font-size: 14px;
      }
    }
  }

  .custeedContext {
    .review-comment {
      color: $custeedBrandColor;
    }
  }
</style>
