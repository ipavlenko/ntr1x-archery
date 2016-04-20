<?php

namespace NTR1X\Widgets\DefaultBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\Yaml\Parser;

use Peekmo\JsonPath\JsonStore;

class DefaultController extends Controller
{
    public function indexAction($item)
    {
        $view = [];

        $view['item'] = $item;

        // передавать сюда путь до json файла если нет данных из БД
        $multiple_json = file_get_contents('https://ru.bookagolf.com/api/v1/portal/i/1/rating/tournament/i/202');
        $view['multiple'] = $multiple_json;

        $view['columns'] = [
            '{$.person.data.NAME.value} {$.person.data.SURNAME.value}',
            '{$.jsAdditionalFields.r1}',
            '{$.jsAdditionalFields.r2}',
            '{$.jsAdditionalFields.r3}',
            '{$.jsAdditionalFields.r4}',
            'i/{$.points}/dev',
        ];

        return $this->render('NTR1XWidgetsDefaultBundle:'.$item['name'].':index.html.twig', $view);
    }
}