<?php

namespace AppBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use AppBundle\Entity\Page;

class LoadPageData implements FixtureInterface
{
    public function load(ObjectManager $manager)
    {
        $firstPage = new Page();
        $firstPage->setName('first');
        $firstPage->setTitle([ "value" => "www" ]);
        $firstPage->setMetas([]);

        $manager->persist($firstPage);
        $manager->flush();
    }
}
