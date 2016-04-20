define(["jquery", "vue", "bundles/ntr1xlayout/schemes"], function($, Vue) {

    console.log($('[data-vue]'));

	$('[data-vue]').each(function(index, element) {

		new Vue({
			el: element,
			data: $(element).data()
		});
	})

});
