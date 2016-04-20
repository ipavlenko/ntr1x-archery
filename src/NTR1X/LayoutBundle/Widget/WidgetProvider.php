<?php

namespace NTR1X\LayoutBundle\Widget;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\Yaml\Parser;

use JMS\Serializer\Annotation as JMS;

/**
 * @JMS\ExclusionPolicy("none")
 */
class WidgetProvider  {

    private $bundle;
    private $alias;

    /**
     * @JMS\Exclude
     */
    private $widgets;

    public function __construct($kernel, $bundle, $alias, $path) {

        $this->bundle = $bundle;
        $this->alias = $alias;

        $resource = $kernel->locateResource('@' . $bundle . '/Resources/config/' . $path);
        $this->widgets = (new Parser())->parse(file_get_contents($resource));
    }

    public function getBundle() {
        return $this->bundle;
    }

    public function getAlias() {
        return $this->alias;
    }

    public function getWidgets() {
        return $this->widgets;
    }
}
