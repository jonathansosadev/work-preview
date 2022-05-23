<template>
<div class="circle-chart">
    <div class="circle-chart__title">
        <span>{{ title }}</span>
    </div>
    <svg class="circle" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin slice">
      <circle cx="50" cy="50" r="50" :fill="bgColor"></circle>
    	<path v-for="path in paths"
            :d="drawPath(path.value)"
            :fill="path.color"
			:transform="`rotate(${path.start * 3.6} 50 50)`">
      </path>
      <circle cx="50" cy="50" r="43" fill="#FFFFFF"></circle>
    </svg>
    <div class="circle-chart__right">
            <div class="info" v-for="(item, index) in sets" v-bind:key="index">
                <svg class="circle-s" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin slice"><circle cx="50" cy="50" r="50" :fill="item.color" /></svg>
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ getPercentage(item.value) }}%</span>
            </div>
    </div>
</div>
</template>

<script>

export default {
    name: 'circularGraph',
    props: [ 'bgColor', 'title', 'sets' ],
	computed: {
  		paths () {
  			const res = this.sets.reduce((acc, set) => {
                acc.sets.push({ ...set, start: acc.start
            });
            acc.start += this.getPercentage(set.value);
  			return acc;
            },
            { 
            sets: [], 
            start: 0 
            });
            return res.sets;
        }
    },
	methods: {
    drawPath (value) {
        var start = 0;
        const newValue = this.getPercentage(value);
        const size = '100',
              rad  = size / 2,
              unit = (Math.PI * 2) / 100,
              end  = newValue * unit - 0.001,
              x1   = rad + rad * Math.sin(start),
              y1   = rad - rad * Math.cos(start),
              x2   = rad + rad * Math.sin(end),
              y2   = rad - rad * Math.cos(end),
              big  = (end - start > Math.PI) ? 1 : 0;
        return `M ${rad},${rad} L ${x1},${y1} A ${rad},${rad} 0 ${big} 1 ${x2},${y2} Z`;
      },
    getPercentage(value) {
      const sum = this.sets.reduce((acc, item) => acc + item.value, 0);
      return Math.ceil((value / sum) * 100);
    }
	}        
}
</script>

<style lang="scss" scoped>
.circle-chart {
  width: 300px;
  height: 200px;
  position: relative;

   &__title {
        font-size: 1rem;
        font-weight: 400;
        color: $dark-grey;
        display: flex;
        text-align: left;
        margin-bottom: 1.5rem;

        span {
            max-width: 300px; 
            word-wrap: break-word;
            line-height: 1.43;
        }
    }
    &__right {
        display: inline-grid;
        position: relative;
        left: 1rem;
        top: -71px;

        .info{
            margin-bottom: .5rem;
        }
        .label{
            font-size: 1rem;
            color: $dark-grey;
            display: block;
            left: 1.2rem;
            position: relative;
            top: -4px;
        }
        .value{
            font-size: .9rem;
            color: $grey;
            position: relative;
            left: 1.2rem;
        }
    }
}
svg.circle {
    position: relative;
	width: 85px;
	height: 85px;
}
svg.circle-s {
    position: absolute;
	width: 10px;
	height: 10px;
}
@media (max-width: $breakpoint-min-sm) {
  .circle-chart {
    text-align: center;

    &__right {
        top: -110px;
        display: inline-flex;
        top: 1rem;
        left: 0;

        .info {
            display: inline-flex;
            margin-bottom: 1rem;
            margin-right: 1rem;
            padding-right: 1.5rem;
        }
        .label{
            top: -3px;
            background: red\9; /* IE 8 and below */
        }
        .value{
            left: 1.5rem;
            top: -2px;
        }
    }
    &__title {
        display: inherit;
        text-align: center;
        margin-bottom: 3rem;
    }
  }
}
</style>
