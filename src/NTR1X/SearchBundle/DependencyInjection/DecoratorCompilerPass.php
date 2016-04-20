<?php

namespace NTR1X\SearchBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Reference;

class DecoratorCompilerPass implements CompilerPassInterface {
	
	public function process(ContainerBuilder $container) {

		if (!$container->has('ntr1_x_search.decorator.manager')) {
			return;
		}

		$definition = $container->findDefinition(
			'ntr1_x_search.decorator.manager'
		);

		$taggedServices = $container->findTaggedServiceIds(
			'ntr1_x_search.decorator'
		);

		foreach ($taggedServices as $id=>$tags) {

			$definition->addMethodCall(
				'register',
				array(new Reference($id))
			);
		}
	}
}
