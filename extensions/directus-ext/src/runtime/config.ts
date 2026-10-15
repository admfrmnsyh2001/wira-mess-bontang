export const BIOSTAR_USER_GROUP = process.env.APP_BIOSTAR_USER_GROUP ?? '';

const accessRightEnabled = Boolean(BIOSTAR_USER_GROUP);

export const config = {
  accessRightEnabled,
  checkoutTime: '13:00',
  checkinTime: '13:00',
  biostarUserGroup: BIOSTAR_USER_GROUP,
};
