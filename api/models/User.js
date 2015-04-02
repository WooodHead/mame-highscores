/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt');

module.exports = {

  attributes: {
		username: { type: 'string'/*, required: true*/ },
		password: 'string',
		email: { type: 'string', required: true },

    user_groups: {
      collection: 'UserGroup',
      via: 'group'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.email; //don't want the email over the api for now
      delete obj.password;
      return obj;
    },

    toProfile: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }

  },

  beforeCreate: function(user, cb) {

    if(!user.email || user.email.trim() === ''){
      return cb("Email address cannot be empty");
    }

    if(user.password !== user.repeatPassword){
      return cb("Passwords do not match");
    }

    User.hashPassword(user.password, function(err, hash) {
      if (err) { return cb(err); }

      user.password = hash;
      cb(null, user);

    });
  },

  hashPassword: function(password, callbackFn){
    bcrypt.genSalt(10, function(err, salt) {
      if(err) { callbackFn(err); }

      bcrypt.hash(password, salt, function(err, hash) {
       callbackFn(err, hash);
      });
    });
  },

  /**
   *
   * @param user user id or user model
   * @param queryOptions
   * @param fnCallback
   */
  points: function(user, queryOptions, fnCallback){

    var userId = (user && typeof user === "object") ? user.id : user;

    var extraWhere = (!!userId) ? " AND u.id = $1 " : "";
    var queryParams = (!!userId) ? [ userId ] : [];

    var pointsQuery =
      "SELECT u.id, group_id, u.username, g.name group_name, player_total_points.total_points FROM \
    (SELECT user_id, group_id, sum(points) total_points \
    FROM \
    (SELECT s.game_id, s.group_id, s.user_id, min(s.rank) top_rank, \
      CASE \
    WHEN min(s.rank) = 1 THEN 8 \
    WHEN min(s.rank) = 2 THEN 5 \
    WHEN min(s.rank) = 3 THEN 3 \
    WHEN min(s.rank) = 4 THEN 2 \
    WHEN min(s.rank) = 5 THEN 1 \
    ELSE 0 \
    END as points \
    FROM (SELECT *, rank() \
    OVER (PARTITION BY s.game_id, um.group_id \
    ORDER BY (0 || regexp_replace(s.score, E'[^0-9]+','','g'))::bigint DESC ) as rank \
    FROM score s, \
      user_machine um WHERE \
    s.alias = um.alias \
    AND s.machine_id = um.machine_id) s \
    WHERE s.rank <= 5 \
    GROUP BY s.game_id, s.group_id, s.user_id ) player_points \
    GROUP BY group_id, user_id \
    ) player_total_points, \
      \"user\" u, \"group\" g \
    WHERE player_total_points.user_id = u.id \
    AND player_total_points.group_id = g.id "
     + extraWhere +
    " ORDER BY total_points DESC";

    User.query(pointsQuery, queryParams, function getPoints(err, results){
      if(err) return fnCallback(err);

      fnCallback(null, results.rows);
    });
  },

  /**
   * Check to see if the user has been setup correctly
   * @param user
   * @param callbackFn
   */
  isUserSetup: function(user, callbackFn){
    UserGroup.findOne({user_id: user.id}).exec(function(err, userGroup){
      callbackFn(err, !!userGroup)
    });
  }


};

