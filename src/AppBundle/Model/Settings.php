<?php

namespace AppBundle\Model;

use AppBundle\Entity\Domain;
use AppBundle\Entity\Page;
use AppBundle\Entity\Schema;
use AppBundle\Entity\Source;
use AppBundle\Entity\Widget;

use JMS\Serializer\Annotation\Type;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Settings
 */
class Settings
{
    /**
     * @Type("array<AppBundle\Entity\Domain>")
     */
    public $domains;

    /**
     * @Type("array<AppBundle\Entity\Page>")
     */
    public $pages;

    /**
     * @Type("array<AppBundle\Entity\Widget>")
     */
    public $widgets;
}
