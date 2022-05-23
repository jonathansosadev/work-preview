<template>
  <div class="role">
    <span class="role__text">
      <Tag
        :content="$t_locale('components/global/UserRole')(userRole || 'User')"
        :background='tagColor'
      />
    </span>
  </div>
</template>

<script>
import Tag from "~/components/ui/Tag";

export default {
  components: { Tag },
  name: 'UserRole',
  props: {
    userRole: String
  },
  computed: {
    tagColor() {
      if (this.userRole === 'SuperAdmin') {
        return 'success-default';
      }
      if (this.userRole === 'Admin') {
        return 'warning-default';
      }
      return 'primary-default';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
