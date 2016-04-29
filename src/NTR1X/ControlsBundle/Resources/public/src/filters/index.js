Vue.filter('jsonPath', function (context, str) {
    if (str === undefined) {
        return;
    }
    
    var re = /{([^}]+)}/g;

    var count = (str.match(re) || []).length;
    if (count > 1) {

        result = str.replace(re, function(match, expr) {
            return JSONPath({
                json: context,
                path: expr
            });
        });
        return result
        
    } else {
        
        expr = str.replace(re, function(match, expr) {
            return expr;
        });
        return JSONPath({
            json: context,
            path: expr
        });
        
    }    
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

