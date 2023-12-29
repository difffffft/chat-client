<template>
  <div class="error-body">
    <div class="error-desc">
      <span class="error-h1">404</span>
      <el-divider direction="vertical"/>
      <span class="error-p">NotFound</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-body {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'LeagueGothicItalic', sans-serif;
}

.error-desc {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fbfbfb;
  padding: 40px 240px;

  .error-h1 {
    font-size: 280px;
    color: #444444;
  }

  .el-divider {
    height: 100px;
    margin: 0 80px 0 100px;
  }

  .error-p {
    font-size: 100px;
    color: #999999;
  }
}
</style>