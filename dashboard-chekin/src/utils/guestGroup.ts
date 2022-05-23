import {GuestGroup, Guest} from './types';

function getGuestLeader(guestGroup?: GuestGroup): Guest | null {
  if (!guestGroup) {
    return null;
  }

  const guestLeaderId = guestGroup?.leader_id;
  const members = guestGroup?.members;

  if (!members?.length || !guestLeaderId) {
    return null;
  }

  return members.find((m) => m.id === guestLeaderId) || null;
}

function getGuestLeaderName(guestGroup?: GuestGroup) {
  const guestLeader = getGuestLeader(guestGroup);
  return guestLeader?.full_name || '';
}

function getGroupMembersNumber(guestGroup?: GuestGroup) {
  if (!guestGroup?.members) {
    return 0;
  }
  return guestGroup.members?.length || 0;
}

function getGroupNumberOfGuests(guestGroup?: GuestGroup) {
  return guestGroup?.number_of_guests || 0;
}

function getGuestGroupMembers(guestGroup?: GuestGroup) {
  return guestGroup?.members || [];
}

function hasAnyCompletedGuest(
  getMemberStatus: (member: Guest) => string,
  guestGroup?: GuestGroup,
) {
  const members = getGuestGroupMembers(guestGroup);

  return members.some((member: Guest) => {
    const memberStatus = getMemberStatus(member);
    return memberStatus === 'COMPLETE';
  });
}

export {
  getGuestLeader,
  getGuestLeaderName,
  getGroupMembersNumber,
  getGroupNumberOfGuests,
  getGuestGroupMembers,
  hasAnyCompletedGuest,
};
