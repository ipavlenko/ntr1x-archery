<?php

namespace NTR1X\LayoutBundle\Repository;

use NTR1X\LayoutBundle\Entity\Portal;
use NTR1X\LayoutBundle\Entity\Resource;

/**
 * PortalRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class PortalRepository extends \Doctrine\ORM\EntityRepository
{
    public function savePortals($portals) {

        $em = $this->getEntityManager();
        foreach ($portals as $data) {
            $this->handlePortal($em, $data);
        }
    }

    private function handlePortal($em, $data) {

        if (isset($data['_action'])) {

            switch ($data['_action']) {
                case 'remove':
                    $this->handlePortalRemove($em, $data);
                    break;
                case 'update':
                    $portal = $this->handlePortalUpdate($em, $data);
                    $this->handlePortalTree($em, $portal, $data);
                    break;
                case 'create':
                    $portal = $this->handlePortalCreate($em, $data);
                    $this->handlePortalTree($em, $portal, $data);
                    break;
            }

        } else {
            $portal = $this->findOneById($data['id']);
            $this->handlePortalTree($em, $portal, $data);
        }
    }

    private function handlePortalCreate($em, $data) {

        $portal = (new Portal())
            ->setName($data['name'])
            ->setTitle($data['title'])
            ->setResource(new Resource())
        ;

        $em->persist($portal);
        $em->flush();

        $resource = $portal->getResource();

        $resource
            ->setName("/portals/{$portal->getId()}")
            ->setParams($this->clearParams($data['resource']['params']))
        ;

        $em->persist($resource);
        $em->flush();

        return $portal;
    }

    private function handlePortalUpdate($em, $data) {

        $portal = $this->findOneById($data['id'])
            ->setName($data['name'])
            ->setTitle($data['title'])
        ;

        $resource = $portal->getResource();

        $resource
            ->setParams($this->clearParams($data['resource']['params']))
        ;

        $em->persist($portal);
        $em->flush();

        return $portal;
    }

    private function handlePortalRemove($em, $data) {

        $portal = $this->findOneById($data['id']);

        $em->remove($portal);
        $em->flush();
    }

    private function handlePortalTree($em, $portal, $data) {
    }

    private function clearParams($data) {

        $array = [];

        foreach ($data as $param) {
            if (!isset($param['_action']) || $param['_action'] != 'remove') {
                $p = $param;
                unset($p['_action']);
                $array[] = $p;
            }
        }

        return $array;
    }
}