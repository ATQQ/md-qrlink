<template>
  <div class="qrcode-container">
    <qrcode-vue :value="url" :size="size" level="H" render-as="svg" />
  </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue';

export default {
  name: 'QRCodeGenerator',
  components: {
    QrcodeVue
  },
  props: {
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 100
    }
  }
};
</script>

<style scoped>
.qrcode-container {
  display: inline-block;
  margin-right: 15px;
  vertical-align: middle;
}
</style>