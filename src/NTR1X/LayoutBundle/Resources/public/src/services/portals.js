Core = window.Core || {};

(function($, Vue, Core, undefined) {

    Core.PortalsFactory = function(owner) {

        return {

            load: (data) => new Promise((resolve, reject) => {

                owner.$http.get('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            create: (data) => new Promise((resolve, reject) => {

                owner.$http.post('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            remove: (data) => new Promise((resolve, reject) => {

                owner.$http.delete('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            // remove: (data) => new Promise((resolve, reject) => {
            //
            //     owner.$http.post('/ws/portals', data).then(
            //         (d) => { owner.portals.remove(d.data.portal); resolve(d); },
            //         (e) => { owner.principal = null; reject(e); }
            //     );
            // }),

            // remove: (data) => new Promise((resolve, reject) => {
            //
            //     owner.$http.delete('/ws/portals', data).then(
            //         (d) => { owner.principal = d.data.principal; resolve(d); },
            //         (e) => { owner.principal = null; reject(e); }
            //     );
            // }),
        };
    }

})(jQuery, Vue, Core);
