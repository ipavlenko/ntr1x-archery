<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use JMS\Serializer\Annotation as JMS;

/**
 * User
 *
 * @ORM\Table(name="user_items")
 * @ORM\Entity(repositoryClass="NTR1X\LayoutBundle\Repository\UserRepository")
 * @JMS\ExclusionPolicy("none")
 */
class User
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
     * @ORM\Column(name="email", type="string", length=255, nullable=false, unique=true)
     */
    private $email;

    /**
     * @var string
     *
     * @ORM\Column(name="pwdhash", type="string", length=255, nullable=false)
     * @JMS\Exclude
     */
    private $pwdhash;

    /**
     * @ORM\OneToMany(targetEntity="Portal", mappedBy="user", fetch="EXTRA_LAZY")
     * @JMS\Exclude
     */
    private $portals;

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
     * Set email
     *
     * @param string $email
     *
     * @return User
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set pwdhash
     *
     * @param string $pwdhash
     *
     * @return User
     */
    public function setPwdhash($pwdhash)
    {
        $this->pwdhash = $pwdhash;

        return $this;
    }

    /**
     * Get pwdhash
     *
     * @return string
     */
    public function getPwdhash()
    {
        return $this->pwdhash;
    }

    /**
     * Add portal
     *
     * @param \NTR1X\LayoutBundle\Entity\Portal $portal
     *
     * @return User
     */
    public function addPortal(\NTR1X\LayoutBundle\Entity\Portal $portal)
    {
        $this->portals[] = $portal;

        return $this;
    }

    /**
     * Remove portal
     *
     * @param \NTR1X\LayoutBundle\Entity\Portal $portal
     */
    public function removePortal(\NTR1X\LayoutBundle\Entity\Portal $portal)
    {
        $this->portals->removeElement($portal);
    }

    /**
     * Get portals
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getPortals()
    {
        return $this->portals;
    }
}
