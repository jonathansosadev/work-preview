<template>
  <div class="custeedbook-sample">

    <div>Le nombre est {{ sampleNumber }}</div>
    <div>Le booléen est {{ sampleBoolean }}</div>
    <div>Le texte est {{ sampleText }}</div>
    <div>Le select est {{ sampleSelect }}</div>
    <div>L'objet est {{ JSON.stringify(sampleJson) }}, la valeur de chicken est {{ sampleJson.chicken }}</div>
    <div>L'array est {{ JSON.stringify(sampleArray) }}, On a dans notre array : </div>
    <br/>
    <Button
      v-for="item in sampleArray"
      :key="item"
      @click="selectedArrayValue = item"
    >
      {{ item }}
    </Button>
    <br/>
    La valeur de l'array selectionnée est {{ selectedArrayValue }}
    <Button @click="sampleCallbackCall()">
      Test de fonction callback
    </Button>
    <div><slot>No slot value</slot></div>
    <div><slot name="named">No slot value slot named</slot></div>

  </div>
</template>


<script>

export default {
  data() {
    return {
      selectedArrayValue: "",
      sampleCallbackIteration: 0
    }
  },
  props: {
    sampleNumber: Number,
    sampleBoolean: Boolean,
    sampleText: String,
    sampleSelect: String,
    sampleJson: Object,
    sampleArray: Array,
    sampleCallback: Function
  },
  methods: {
    sampleCallbackCall() {
      this.sampleCallbackIteration++;
      this.sampleCallback(this.sampleCallbackIteration, 'teehee');
    }
  },
  computed: {
  }

};
</script>


<style lang="scss" scoped>
.red {
  color:red;
}
</style>
