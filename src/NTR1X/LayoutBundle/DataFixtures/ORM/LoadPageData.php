<?php

namespace NTR1X\LayoutBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use NTR1X\LayoutBundle\Entity\Page;
use NTR1X\LayoutBundle\Entity\Resource;

class LoadPageData implements FixtureInterface
{
    public function load(ObjectManager $manager)
    {

        $paageResource = new Resource();
        $paageResource->setName('/pages/1');
        $paageResource->setParams([]);

        $manager->persist($paageResource);
        $manager->flush();

        $firstPage = new Page();
        $firstPage->setName('first');
        $firstPage->setResource($paageResource);
        $firstPage->setTitle([ "value" => "www" ]);
        $firstPage->setMetas([]);
                
        $manager->persist($firstPage);
        $manager->flush();
    }
}
