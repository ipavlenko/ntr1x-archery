<?php

namespace NTR1X\SearchBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;

use NTR1X\SearchBundle\DependencyInjection\DecoratorCompilerPass;

class NTR1XSearchBundle extends Bundle {
	
	public function build(ContainerBuilder $container) {

		parent::build($container);

		$container->addCompilerPass(new DecoratorCompilerPass());
	}
}
