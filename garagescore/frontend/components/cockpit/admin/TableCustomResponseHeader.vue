<template>
  <div class="thead">
    <div class="table-header-Response">
      <TableHeader :style="{ flex: 2 }" :display="['md', 'lg']">{{ $t_locale('components/cockpit/admin/TableCustomResponseHeader')('Models') }}</TableHeader>
      <TableHeader center>{{ $t_locale('components/cockpit/admin/TableCustomResponseHeader')('Clients') }}</TableHeader>
      <TableHeader center>{{ $t_locale('components/cockpit/admin/TableCustomResponseHeader')('Sources') }}</TableHeader>
      <TableHeader center :display="['md', 'lg']">{{ $t_locale('components/cockpit/admin/TableCustomResponseHeader')('Garage') }}</TableHeader>
      <TableHeader center :display="['sm']">{{ $t_locale('components/cockpit/admin/TableCustomResponseHeader')('Garage_short') }}</TableHeader>
      <TableHeader center>{{ $t_locale('components/cockpit/admin/TableCustomResponseHeader')('Mode') }}</TableHeader>
      <TableHeader center>{{ $t_locale('components/cockpit/admin/TableCustomResponseHeader')('Actions') }}</TableHeader>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style lang="scss" scoped>
.thead {
  border-bottom: 1px solid rgba($grey, 0.5);
  .table-header-Response {
    display: flex;
    padding: 0 1.5rem;
  }
}
</style>
