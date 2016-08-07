<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use JMS\Serializer\Annotation as JMS;

/**
 * Publication
 *
 * @ORM\Table(name="publication_items")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\PublicationRepository")
 * @JMS\ExclusionPolicy("none")
 */
class Publication
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="User", inversedBy="portals")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=false)
     * @JMS\Exclude
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity="Portal")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=false)
     */
    private $portal;

    public function __construct() {
    }
}
