<template>
  <div class="thead_time">
    <div class="thead_time__header">
        <TableHeader >{{ $t_locale('components/cockpit/admin/TableConfigTimeAnswerHeader')("Garages") }}</TableHeader>
        <TableHeader :style="{ flex: 1.4 }" ></TableHeader>
        <TableHeader right>{{ $t_locale('components/cockpit/admin/TableConfigTimeAnswerHeader')("reponseTime") }}</TableHeader>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .thead_time{
    border-bottom: 1px solid rgba($grey, .5);
    padding-left: 1.3rem;
    padding-right: 2.5rem;
    &__header{
      display: flex;
      margin-bottom: -.3rem;
    }
  }

  ::v-deep .table__row-body {
    margin: 0 !important;
  }
</style>