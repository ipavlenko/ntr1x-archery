Vue.filter('jsonPath', function (context, str) {
    if (str === undefined) {
        return;
    }

    // if matches more then 1 should call jsonPathExpression
    var re = /{([^}]+)}/g;

    var count = (str.match(re) || []).length;
    if (count > 1) {

        // how call?
        //jsonPathExpression(context, str);

        console.log(this.$options.filters);
    }

    expr = str.replace(re, function(match, expr) {
        return expr;
    });
    return JSONPath({
        json: context,
        path: expr
    });
});

Vue.filter('jsonPathExpression', function (context, str) {
    var re = /{([^}]+)}/g;
    result = str.replace(re, function(match, expr) {
        return JSONPath({
            json: context,
            path: expr
        });
    });
    return result
});

Vue.filter('assign', function (target, source1, source2, source3) {

	return Object.assign(target, source1, source2, source3);
});

Vue.filter('copy', function (source) {

	return new Vue({
		data: source != null
			? JSON.parse(JSON.stringify(source))
			: null
	}).$data;
});

Vue.filter('clone', function (source) {

	return new Vue({
		data: source != null
			? JSON.parse(JSON.stringify(source))
			: null
	}).$data;
});

