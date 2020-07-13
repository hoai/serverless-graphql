
const {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql')

const redis = require("redis");

let redisClient = redis.createClient ({
    host : 'YOUR_ENDPOINT',
    port : 'YOUR_PORT',
    password: 'YOUR_PASSWORD'
});

const getGreeting = (city) => {
    return new Promise(function(resolve, reject) {
        redisClient.get(city, function(err, country) {
            redisClient.quit()
            resolve(`Hello ${city}, ${country || 'World'}!`)
        })
    });
};

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQueryType', // an arbitrary name
        fields: {
            greeting: {
                // we need to know the user's name to greet them
                args: {city: {name: 'city', type: new GraphQLNonNull(GraphQLString)}},
                // the greeting message is a string
                type: GraphQLString,
                // resolve to a greeting message
                resolve: (parent, args) =>  getGreeting(args.city)
            }
        }
    }),
})

exports.lambdaHandler = (event, context, callback) => {
    graphql(schema, event.queryStringParameters.query)
        .then(
            result => callback(null, {statusCode: 200, body: JSON.stringify(result)}),
            err => callback(err)
        )
};
