How to setup

1. git clone https://github.com/ipavlenko/ntr1x-archery.git
2. composer install
3. php bin/console assets:install --symlink --relative
4. php bin/console doctrine:generate:entities AppBundle
5. php bin/console doctrine:schema:update --force
6. php bin/console doctrine:fixtures:load
7. npm install
8. bower install
9. gulp

