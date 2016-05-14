<?php

namespace NTR1X\LayoutBundle\Twig;

use NTR1X\LayoutBundle\Widget\WidgetManager;

use Peekmo\JsonPath\JsonStore;

class WidgetTwigExtension extends \Twig_Extension implements \Twig_Extension_GlobalsInterface
{

    private $manager;

    public function __construct(WidgetManager $manager)
    {
        $this->manager = $manager;
    }

    public function getName()
    {
        return 'widget_extension';
    }

    public function getGlobals()
    {

        return [
            'widget' => array(
                'styles' => $this->manager->getStyles(),
                'scripts' => $this->manager->getScripts(),
                'templates' => $this->manager->getTemplates(),
            ),

        ];
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('jsonPathExpression', [$this, 'jsonPathExpression']),
        ];
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('jsonPath', [$this, 'jsonPath']),
        ];
    }

    public function jsonPath($context, $str)
    {
        $store = new JsonStore($context);
        return $store->get($str);
    }

    public function jsonPathExpression($context, $str)
    {
        if (isset($str) && isset($context)) {
            return preg_replace_callback("/{([^}]+)}/", function ($matches) use (&$context) {
                $store = new JsonStore($context);
                $res = $store->get($matches[1]);
                if (isset($res) && is_array($res)) {
                    return implode(',', $res);
                }
                return $res;
            }, $str);
        }
        return null;
    }
}
