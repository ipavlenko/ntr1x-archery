<?php

namespace AppBundle\Twig;

use AppBundle\Component\ComponentManager;
use JMS\Serializer\SerializationContext;

class LayoutTwigExtension extends \Twig_Extension implements \Twig_Extension_GlobalsInterface {

    private $manager;

    public function __construct(ComponentManager $manager) {
        $this->manager = $manager;
    }

	public function getGlobals() {

        $withoutNulls = new SerializationContext();
        $withNulls = new SerializationContext();
        $withNulls->setSerializeNull(true);

		return [
            'layout' => array(
                'styles' => $this->manager->getStyles(),
                'scripts' => $this->manager->getScripts(),
                'templates' => $this->manager->getTemplates(),
                'jms' => [
                    'withNulls' => $withNulls,
                    'withoutNulls' => $withoutNulls,
                ]
            )
		];
	}

	public function getName() {

		return 'layout_extension';
	}
}
