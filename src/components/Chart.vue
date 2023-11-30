<template>
  <div>
    <apexchart width="380" type="donut" :options="options" :series="series"></apexchart>
  </div>
</template>

<script>
export default {
  data() {
    return {
      options: {
        // Your chart options here
      },
      series: [44, 55, 41, 17, 15],
    };
  },
};
</script>
