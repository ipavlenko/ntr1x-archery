Vue.directive('rich', {

    bind: function () {

        if (window.CKEDITOR) {

            this.editor = CKEDITOR.inline(this.el, {
                stylesSet: [
                    { name: 'Bolder', element: 'span', attributes: { 'class': 'extrabold'} }
                ],
                toolbarGroups: [
                    // { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                    // { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
                    { name: 'links' },
                    // { name: 'forms' },
                    {name: 'tools'},
                    {name: 'document', groups: ['mode', 'document', 'doctools']},
                    {name: 'others'},
                    {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align']},
                    {name: 'colors'},
                    '/',
                    {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                    {name: 'styles'},
                    '/',
                    { name: 'insert', groups: [ 'ImageButton' ]  }
                    //{name: 'about'}
                ]
            });

            this.editor.on('change', function() {
                this.editor.updateElement();
                this.vm.$set(this.expression, $(this.el).val());
            }.bind(this));

            this.editor.setData(this.vm.$get(this.expression));
        }
    },

    update: function (newValue, oldValue) {
        // console.log('update', newValue, oldValue);
    },

    unbind: function () {
        this.editor.destroy();
        this.editor = null;
        this.textarea = null;
        this.input = null;
    }
});
