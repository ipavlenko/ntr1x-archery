<?php

namespace NTR1X\LayoutBundle\Widget;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\Yaml\Parser;

use JMS\Serializer\Annotation as JMS;

/**
 * @JMS\ExclusionPolicy("none")
 */
class CategoryProvider  {

    /**
     * @JMS\Exclude
     */
    private $categories;

    public function __construct($kernel, $bundle, $path) {

        $this->bundle = $bundle;

        $resource = $kernel->locateResource('@' . $bundle . '/Resources/config/' . $path);
        $this->categories = (new Parser())->parse(file_get_contents($resource));
    }

    public function getCategories() {
        return $this->categories;
    }
}
