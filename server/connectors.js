import rp from 'request-promise';

// REST backend / service
const DTFund = {
  getOne() {
    return rp('https://trashmountain.donortools.com/funds.json', {
      auth: {
        user: Meteor.settings.DT.user,
        pass: Meteor.settings.DT.pass,
      },
    })
      .then(res => JSON.parse(res))
      .then((res) => {
        logger.info(res[0].fund);
        return res[0].fund.id;
      });
  },
};

export { DTFund };
