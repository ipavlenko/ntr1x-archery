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
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=511)
     */
    private $title;

    /**
     * @var integer
     *
     * @ORM\Column(name="`order`", type="integer", nullable=true)
     */
    private $order;

    /**
     * @ORM\ManyToOne(targetEntity="User", inversedBy="portals")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=false)
     * @JMS\Exclude
     */
    private $user;

    /**
     * @ORM\OneToOne(targetEntity="Portal", inversedBy="publication", fetch="EXTRA_LAZY")
     * @ORM\JoinColumn(name="portal_id", referencedColumnName="id", nullable=false)
     * @JMS\Exclude
     */
    private $portal;

    /**
     * @var \NTR1X\AppBundle\Entity\Upload
     *
     * @ORM\OneToOne(targetEntity="Upload", orphanRemoval=true, fetch="EAGER", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="thumbnail_id", referencedColumnName="id")
     */
    private $thumbnail;

    public function __construct() {
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title
     *
     * @param string $title
     *
     * @return Publication
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set order
     *
     * @param integer $order
     *
     * @return Publication
     */
    public function setOrder($order)
    {
        $this->order = $order;

        return $this;
    }

    /**
     * Get order
     *
     * @return integer
     */
    public function getOrder()
    {
        return $this->order;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\User $user
     *
     * @return Publication
     */
    public function setUser(\AppBundle\Entity\User $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set portal
     *
     * @param \AppBundle\Entity\Portal $portal
     *
     * @return Publication
     */
    public function setPortal(\AppBundle\Entity\Portal $portal)
    {
        $this->portal = $portal;

        return $this;
    }

    /**
     * Get portal
     *
     * @return \AppBundle\Entity\Portal
     */
    public function getPortal()
    {
        return $this->portal;
    }

    /**
     * Set thumbnail
     *
     * @param \AppBundle\Entity\Upload $thumbnail
     *
     * @return Publication
     */
    public function setThumbnail(\AppBundle\Entity\Upload $thumbnail = null)
    {
        $this->thumbnail = $thumbnail;

        return $this;
    }

    /**
     * Get thumbnail
     *
     * @return \AppBundle\Entity\Upload
     */
    public function getThumbnail()
    {
        return $this->thumbnail;
    }
}
