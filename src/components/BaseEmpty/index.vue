<template>
  <div class="base-empty">
    <img src="@/assets/images/assets-images-logo.png" alt=""/>
    <span>How can I help you today?</span>
  </div>
</template>

<style lang="scss" scoped>
.base-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  img {
    width: 70px;
    height: 70px;
  }

  span {
    font-weight: 600;
    font-size: 24px;
    margin-top: 16px;
    margin-bottom: 20%;
  }
}


@media screen and (max-width: $m-mobile-width) {
  img {
    width: 56px !important;
    height: 56px !important;
  }
  span {
    font-size: 16px !important;
    margin-bottom: 50% !important;
  }
}
</style>