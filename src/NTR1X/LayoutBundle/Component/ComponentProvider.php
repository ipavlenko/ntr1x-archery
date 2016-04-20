<?php

namespace NTR1X\LayoutBundle\Component;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\Yaml\Parser;

class ComponentProvider  {

    private $bundle;
    private $alias;
    private $components;

    public function __construct($kernel, $bundle, $alias, $path) {

        $this->bundle = $bundle;
        $this->alias = $alias;

        $resource = $kernel->locateResource('@' . $bundle . '/Resources/config/' . $path);
        $array = (new Parser())->parse(file_get_contents($resource));
        foreach ($array as $config) {
            $this->components[] = new Component($this, $config);
        }
    }

    public function getBundle() {
        return $this->bundle;
    }

    public function getAlias() {
        return $this->alias;
    }

    public function getComponents() {
        return $this->components;
    }
}
