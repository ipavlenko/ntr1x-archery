<?php

namespace NTR1X\LayoutBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;

use NTR1X\LayoutBundle\DependencyInjection\ComponentCompilerPass;
use NTR1X\LayoutBundle\DependencyInjection\WidgetCompilerPass;

class NTR1XLayoutBundle extends Bundle
{
    public function build(ContainerBuilder $container) {

		parent::build($container);

		$container->addCompilerPass(new ComponentCompilerPass());
        $container->addCompilerPass(new WidgetCompilerPass());
	}
}
