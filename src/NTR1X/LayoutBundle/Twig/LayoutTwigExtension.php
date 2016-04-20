<?php

namespace NTR1X\LayoutBundle\Twig;

use NTR1X\LayoutBundle\Component\ComponentManager;

class LayoutTwigExtension extends \Twig_Extension {

    private $manager;

    public function __construct(ComponentManager $manager) {
        $this->manager = $manager;
    }

	public function getGlobals() {

		return [
            'layout' => array(
                'styles' => $this->manager->getStyles(),
                'scripts' => $this->manager->getScripts(),
                'templates' => $this->manager->getTemplates(),
            )
		];
	}

	public function getName() {

		return 'layout_extension';
	}
}
