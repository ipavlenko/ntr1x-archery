<?php

namespace NTR1X\LayoutBundle\Model;

use NTR1X\LayoutBundle\Entity\Domain;
use NTR1X\LayoutBundle\Entity\Page;
use NTR1X\LayoutBundle\Entity\Schema;
use NTR1X\LayoutBundle\Entity\Source;
use NTR1X\LayoutBundle\Entity\Widget;

use JMS\Serializer\Annotation\Type;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Settings
 */
class Settings
{
    /**
     * @Type("array<NTR1X\LayoutBundle\Entity\Domain>")
     */
    public $domains;

    /**
     * @Type("array<NTR1X\LayoutBundle\Entity\Page>")
     */
    public $pages;

    /**
     * @Type("array<NTR1X\LayoutBundle\Entity\Schema>")
     */
    public $schemes;

    /**
     * @Type("array<NTR1X\LayoutBundle\Entity\Widget>")
     */
    public $widgets;
}
