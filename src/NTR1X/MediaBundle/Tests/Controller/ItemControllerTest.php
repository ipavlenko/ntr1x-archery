<?php

namespace NTR1X\MediaBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ItemControllerTest extends WebTestCase
{
    public function testShowmediaitem()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/media/{id}');
    }

    public function testListmediaitems()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/media');
    }

}
